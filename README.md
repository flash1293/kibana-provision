# kibana-provision

Automatically provision and manage Kibana saved objects with ease.

There are two parts to `kibana-provision`:
* A command line helper to load Kibana saved objects as readable JSON files and write them back
* A Kibana plugin to automatically provision Kibana spaces via local JSON files, http urls or data urls

# Usage

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
