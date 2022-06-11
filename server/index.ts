import { schema } from '@kbn/config-schema';
import { createListStream } from '@kbn/utils';
import { Observable } from 'rxjs';
import {
  CoreSetup,
  CoreStart,
  Logger,
  PluginConfigDescriptor,
  PluginInitializerContext,
  Plugin,
  SavedObjectsClient,
} from '../../../src/core/server';
import { SpacesPluginStart } from '../../../x-pack/plugins/spaces/server';
const fs = require('fs');

const soTypes = ['index-pattern', 'dashboard', 'lens', 'map', 'search', 'query', 'visualization'];

function packJSONPropsInPlace(object: Record<string, object | string>) {
  Object.keys(object).forEach((key) => {
    if (typeof object[key] !== 'object' || object[key] === null) {
      return;
    }
    if (key.endsWith('JSON') || key == 'visState') {
      object[key] = JSON.stringify(object[key]);
      return;
    }
    packJSONPropsInPlace(object[key] as Record<string, object | string>);
  });
}

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

type ProvisionConfig = undefined | Array<{ path: string; spaceId: string }>;

export const config: PluginConfigDescriptor<ProvisionConfig> = {
  schema: schema.maybe(
    schema.arrayOf(
      schema.object({
        path: schema.string(),
        spaceId: schema.string(),
      })
    )
  ),
};

export class ProvisionPlugin implements Plugin {
  private readonly logger: Logger;
  config: Observable<ProvisionConfig>;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    this.config = initializerContext.config.create<ProvisionConfig>();

    initializerContext.config.create<ProvisionConfig>();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('provision: Setup');
    return {};
  }

  public start(core: CoreStart, plugins: { spaces: SpacesPluginStart }) {
    const adminClient = new SavedObjectsClient(
      core.savedObjects.createInternalRepository(['space'])
    );
    this.logger.debug('provision: Started');
    this.config.subscribe((config) => {
      if (config && config.length > 0) {
        this.logger.info(`Starting provisioning of ${config.length} config sets`);
      }
      (config || []).forEach(async ({ path, spaceId }) => {
        try {
          const existingSpace = await adminClient.find({
            type: 'space',
            perPage: 1,
            search: spaceId,
          });
          if (existingSpace.total === 0) {
            await adminClient.create('space', { name: spaceId, disabledFeatures: [] }, { id: spaceId });
          }
          const namespace = plugins.spaces.spacesService.spaceIdToNamespace(spaceId);
          const importer = core.savedObjects.createImporter(adminClient);
          const objects: unknown[] = [];
          ``;
          let counter = 0;
          fs.readdirSync(path, { encoding: 'utf8' }).forEach((file: string) => {
            const fullPath = `${path}/${file}`;
            if (soTypes.some(type => file.startsWith(type)) && file.endsWith('.json')) {
              const object = JSON.parse(fs.readFileSync(fullPath, { encoding: 'utf8' }));
              packJSONPropsInPlace(object);
              objects.push(object);
              counter++;
            }
          });

          const response = await importer.import({
            overwrite: true,
            namespace,
            readStream: createListStream(objects),
            createNewCopies: false,
          });
          if (response.errors && response.errors.length) {
            this.logger.error('Errors during provisioning');
            this.logger.error(JSON.stringify(response.errors, null, 2));
          }
          if (response.warnings.length) {
            this.logger.warn('Warnings during provisioning');
            this.logger.warn(JSON.stringify(response.warnings, null, 2));
          }
          if (response.successCount > 0) {
            this.logger.info(`Successfully imported ${response.successCount} objects from "${path}" into ${spaceId}`);
          }
        } catch (e) {
          this.logger.error(e);
        }
      });
    });
    return {};
  }

  public stop() {}
}

export function plugin(initializerContext: PluginInitializerContext) {
  return new ProvisionPlugin(initializerContext);
}
