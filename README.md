# kibana-provision

<<<<<<< HEAD
Automatically provision and manage Kibana saved objects with ease.

There are two parts to `kibana-provision`:
* A command line helper to load Kibana saved objects as readable JSON files and write them back
* A Kibana plugin to automatically provision Kibana spaces via local JSON files, http urls or data urls
=======
A command line helper and a Kibana plugin to easily provision Kibana saved objects in a fresh Kibana instance.
>>>>>>> 47eed15eeaa7706540f7d4abb747229de648846c

# Usage

Note: For now this only supports a subset of all saved objects types: https://github.com/flash1293/kibana-provision/blob/master/index.js#L11

## `pull`

Pulling saved objects from space: `URL_KIBANA=http[s]://username:password@kibana_host:port/base_path npx kibana-provision pull <space-id>`

This will pull all saved objects from the given space into `json` files in the current directory (named `<type>-<id>.json`). stringified `*JSON` properties are parsed to JSON for easier editing. Use `default` as space id for the implicit default space.

## `push`

Pushing local saved objects into space: `URL_KIBANA=http[s]://username:password@kibana_host:port/base_path npx kibana-provision push <space-id> [--watch]`

This will push all files in the current directory following the `<type>-<id>.json` naming scheme into the specified space, overwriting existing objects. For development: If `--watch` is set, it fill watch for changes to the local files and re-push on every change. Use `default` as space id for the implicit default space.

## `pack`

Individual json files are not compatible with the out-of-the-box import APIs of Kibana. To turn the JSON files into a compatible ndjson file you can also import via UI or automatically provision via http, call `npx kibana-provision pack [file]`. This will generate a file `export.ndjson` (or specified file name) in the current working directory.

## `data-url`

Like `pack`, but instead of writing to an ndjson file, it outputs the content as base64 encoded data url. You can use this to inline a configuration into the `kibana.yml` file directly.

## `unpack`

Explode a regular ndjson file into individual json files which can be edited comfortably and be used with `push`. To explode the file `export.ndjson` (or specified file name) in your current working directory into individual json files, call `npx kibana-provision unpack [file]`.

## Example workflow: Keeping your dashboard under version control

### Initialization
* Create a new space just for you
* Put together your dashboard
* Use `pull` command to pull into empty directory
* Check into your version control


### Rollout (this depends a lot on your setup, another approach would be mounting the working copy into a docker container as a volume, etc.)
* Checkout your repository on host running production Kibana instance
* Edit `kibana.yml` to load working copy directory into shared space used by analysts
* (Re)start Kibana or send `SIGHUP` signal to kick off provisioning

### Updates
* Start `push --watch` on your private space
* Change config files in your preferred text editor
* Refresh dashboard to see changes
* When doing changes in the Kibana UI, run `pull` afterwards to update your local image
* When finished, commit to version control and run `push` on the shared space

## Automatic provisioning

Installing the plugin `provision` will make it possible to load a local directory following the `<type>-<id>.json` naming scheme on Kibana start / config reload via `SIGHUP` signal to the Kibana process.
When the defined `location` is a valid http(s) url, it is downloaded and treated as a `pack`ed ndjson file (ndjson files exported via Kibana api or saved object management UI work as well in the same way). Using the `data-url` command the file can also be inlined into the config file.
Set the following in your `kibana.yml`:
```
provision:
  - location: /path/to/local/dir/containing/json/files
    spaceId: space to load with objects 
  - location: https://example.org/location/of/packed/objects.ndjson
    spaceId: space to load with objects 
  - location: data:text;base64,eyJhdHRyaWJ1....
    spaceId: space to load with objects 
```

Use `default` as space id for the implicit default space.

This will override existing saved objects in the space with the same id. Saved objects with unknown ids won't be touched. If the space does not exist yet, it will be created (with all features enabled). It's possible to load multiple directories into a single space. Multiple config sets are loaded in order which means if the same saved object is defined in multiple config sets for the same space, the last definition wins.

# Development

To run the cli locally, use `npx /path/to/the/working/copy/of/this/repository <command> <args>`.

For plugin development, see the [kibana contributing guide](https://github.com/elastic/kibana/blob/main/CONTRIBUTING.md) for instructions setting up your development environment.

## Scripts

<dl>
  <dt><code>yarn kbn bootstrap</code></dt>
  <dd>Execute this to install node_modules and setup the dependencies in your plugin and in Kibana</dd>

  <dt><code>yarn plugin-helpers build</code></dt>
  <dd>Execute this to create a distributable version of this plugin that can be installed in Kibana</dd>
</dl>
