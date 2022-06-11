# kibana-provision

A command line helper and a Kibana plugin to easily provision Kibana saved objects in a fresh Kibana instance

# Usage

## `pull`

Pulling saved objects from space: `URL_KIBANA=http[s]://username:password@kibana_host:port/base_path npx kibana-provision pull <space-id>`

This will pull all saved objects from the given space into `json` files in the current directory (named `<type>-<id>.json`). stringified `*JSON` properties are parsed to JSON for easier editing.

## `push`

Pushing local saved objects into space: `URL_KIBANA=http[s]://username:password@kibana_host:port/base_path npx kibana-provision push <space-id> [--watch]`

This will push all files in the current directory following the `<type>-<id>.json` naming scheme into the specified space, overwriting existing objects. For development: If `--watch` is set, it fill watch for changes to the local files and re-push on every change.

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
Set the following in your `kibana.yml`:
```
provision:
  - path: /path/to/local/dir/containing/json/files
    spaceId: space to load with objects 
```

This will override existing saved objects in the space with the same id. Saved objects with unknown ids won't be touched. If the space does not exist yet, it will be created (with all features enabled). It's possible to load multiple directories into a single space.

# Development

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/main/CONTRIBUTING.md) for instructions setting up your development environment.

## Scripts

<dl>
  <dt><code>yarn kbn bootstrap</code></dt>
  <dd>Execute this to install node_modules and setup the dependencies in your plugin and in Kibana</dd>

  <dt><code>yarn plugin-helpers build</code></dt>
  <dd>Execute this to create a distributable version of this plugin that can be installed in Kibana</dd>
</dl>
