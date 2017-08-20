const {write, writeln, GREEN, RESET} = require("ringo/term");
const fs = require("fs");
const system = require("system");
const {Parser} = require("ringo/args");

const {identify, resize} = require("./helpers");

const parser = new Parser();
parser.addOption("i", "input", "INPUT", "image input directory");
parser.addOption("o", "output", "OUTPUT", "image output directory");
parser.addOption("c", "config", "CONFIG", "config file");
parser.addOption("h", "help", null, "display the help");

const options = parser.parse(system.args.slice(1));

if (options.help || !Object.keys(options).length) {
    writeln(parser.help());
    system.exit(1);
}

if (!options.config || !fs.exists(options.config)) {
    writeln("Invalid config!" + options.toSource());
    writeln(parser.help());
    system.exit(1);
}

const config = require(options.config);

if (!Array.isArray(config.versions)) {
    writeln("Invalid config!");
    system.exit(1);
}

if (!fs.isDirectory(options.input) || !fs.isDirectory(options.output)) {
    writeln("Input and output directory must exist!");
    writeln(parser.help());
    system.exit(1);
}

const inputFiles = fs.list(options.input).map(function(path) {
    return fs.absolute(fs.join(options.input, path));
}).filter(function(path) {
    return fs.isReadable(path) && fs.isFile(path) && fs.extension(path) === ".jpg";
});

const metaInfo = [];

inputFiles.forEach(function(imagePath) {
    const metaObj = {
        dimensions: identify(imagePath)
    };
    metaObj.ratio = metaObj.dimensions[0] / metaObj.dimensions[1]; 

    config.versions.forEach(function(version) {
        const versionFileName = fs.base(imagePath, fs.extension(imagePath)) + "_" + version.name + ".jpg";
        metaObj[version.name] = versionFileName;
        const out = resize(
            imagePath,
            fs.join(options.output, versionFileName),
            version.boundary,
            version.quality
        );
        writeln(GREEN, "Finished " + imagePath + " version " + version, RESET);
    });

    metaInfo.push(metaObj);
    writeln("---------------");
});

writeln(GREEN, "Writing metadata object ...", RESET);
fs.write(fs.join(options.output, "meta.json"), JSON.stringify(metaInfo, null, 2), {
    charset: "UTF-8"
});

writeln("Done.", RESET);
system.exit(0);