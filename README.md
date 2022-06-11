# kibana-provision

A command line helper and a Kibana plugin to easily provision Kibana saved objects in a fresh Kibana instance

# Usage

## `pull`

Pulling saved objects from space: `URL_KIBANA=http[s]://username:password@kibana_host:port/base_path npx kibana-provision pull <space-id>`

This will pull all saved objects from the given space into `json` files in the current directory (named `<type>-<id>.json`). stringified `*JSON` properties are parsed to JSON for easier editing.

## `push`

Pushing local saved objects into space: `URL_KIBANA=http[s]://username:password@kibana_host:port/base_path npx kibana-provision push <space-id> [--watch]`

This will push all files in the current directory following the `<type>-<id>.json` naming scheme into the specified space, overwriting existing objects. For development: If `--watch` is set, it fill watch for changes to the local files and re-push on every change.

## Automatic provisioning

Installing the plugin `provision` will make it possible to load a local directory following the `<type>-<id>.json` naming scheme on Kibana start / config reload via `SIGHUP` signal to the Kibana process.
Set the following in your `kibana.yml`:
```
provision:
  - path: /path/to/local/dir/containing/json/files
    spaceId: space to load with objects 
```

# Development

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/main/CONTRIBUTING.md) for instructions setting up your development environment.

## Scripts

<dl>
  <dt><code>yarn kbn bootstrap</code></dt>
  <dd>Execute this to install node_modules and setup the dependencies in your plugin and in Kibana</dd>

  <dt><code>yarn plugin-helpers build</code></dt>
  <dd>Execute this to create a distributable version of this plugin that can be installed in Kibana</dd>
</dl>
