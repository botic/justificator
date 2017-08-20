const {command} = require("ringo/subprocess");

exports.identify = function(imagePath) {
    const output = command("gm", "identify",
        "-format", "%w;%h",
        imagePath
    );

    const dimensions = output.split(";").map(function(dim) {
        return parseInt(dim, 10);
    });

    if (dimensions.length !== 2 || Number.isNaN(dimensions[0]) ||
        Number.isNaN(dimensions[1]) || dimensions[0] <= 0 || dimensions[1] <= 0) {
        throw new Error("Invalid image at " + imagePath);
    }

    return dimensions;
};

exports.resize = function(inputImagePath, outputImagePath, boundary, quality) {
    return command("gm", "convert",
        "-size", boundary,
        inputImagePath,
        "-resize", boundary,
        "-strip",
        "-auto-orient",
        "-quality", quality,
        outputImagePath
    );
};