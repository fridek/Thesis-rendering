/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 11:14
 * To change this template use File | Settings | File Templates.
 */

goog.require('goog.net.XhrIo');

goog.provide("Rendering.Import.Element_Array");

Rendering.Import.Element_Array = function() {
    this.load = function(verticesFile, facesFile, callback) {
        var oneCompleted = false;

        var verticesText, facesText;
        var parse = function() {
            var verticesLines = verticesText.split("\n");
            var _vertices = new Float32Array(verticesLines.length*3);

            var hasNormals = (verticesLines[0].split(" ").length > 3);
            var hasUVs = (verticesLines[0].split(" ").length > 6);

            if(hasNormals) {
                var _normals = new Float32Array(verticesLines.length*3);
            } // 3-element vector for every 3 points for one triangle
            if(hasUVs) {
                var _uvs = new Float32Array(verticesLines.length*2);
            } // 2-coords for every 3 points for one triangle

            for(var i = 0; i < verticesLines.length; i++) {
                var parts = verticesLines[i].split(" ");
                _vertices[i*3 + 0] = parts[0];
                _vertices[i*3 + 1] = parts[1];
                _vertices[i*3 + 2] = parts[2];
                if(hasNormals) {
                    _normals[i*3 + 0] = parts[3];
                    _normals[i*3 + 1] = parts[4];
                    _normals[i*3 + 2] = parts[5];
                }
                if(hasUVs) {
                    _uvs[i*2 + 0] = parts[6];
                    _uvs[i*2 + 1] = parts[7];
                }
            }

            var facesLines = facesText.split("\n");

            var vertices = new Float32Array(facesLines.length*3*3); // 3-coords for every 3 points for one triangle
            var normals = new Float32Array(facesLines.length*3*3); // 3-element vector for every 3 points for one triangle
            var uvs = new Float32Array(facesLines.length*2*3); // 2-coords for every 3 points for one triangle

            for(i = 0; i < facesLines.length; i++) {
                parts = facesLines[i].split(" ");
                vertices[i*9 + 0] = _vertices[parts[1]*3 + 0];
                vertices[i*9 + 1] = _vertices[parts[1]*3 + 1];
                vertices[i*9 + 2] = _vertices[parts[1]*3 + 2];

                vertices[i*9 + 3] = _vertices[parts[2]*3 + 0];
                vertices[i*9 + 4] = _vertices[parts[2]*3 + 1];
                vertices[i*9 + 5] = _vertices[parts[2]*3 + 2];

                vertices[i*9 + 6] = _vertices[parts[3]*3 + 0];
                vertices[i*9 + 7] = _vertices[parts[3]*3 + 1];
                vertices[i*9 + 8] = _vertices[parts[3]*3 + 2];
                if(hasNormals) {
                    normals[i*9 + 0] = _normals[parts[1]*3 + 0];
                    normals[i*9 + 1] = _normals[parts[1]*3 + 1];
                    normals[i*9 + 2] = _normals[parts[1]*3 + 2];

                    normals[i*9 + 3] = _normals[parts[2]*3 + 0];
                    normals[i*9 + 4] = _normals[parts[2]*3 + 1];
                    normals[i*9 + 5] = _normals[parts[2]*3 + 2];

                    normals[i*9 + 6] = _normals[parts[3]*3 + 0];
                    normals[i*9 + 7] = _normals[parts[3]*3 + 1];
                    normals[i*9 + 8] = _normals[parts[3]*3 + 2];
                }
                if(hasUVs) {
                    uvs[i*6 + 0] = _uvs[parts[1]*2 + 0];
                    uvs[i*6 + 1] = _uvs[parts[1]*2 + 1];

                    uvs[i*6 + 2] = _uvs[parts[2]*2 + 0];
                    uvs[i*6 + 3] = _uvs[parts[2]*2 + 1];

                    uvs[i*6 + 4] = _uvs[parts[3]*2 + 0];
                    uvs[i*6 + 5] = _uvs[parts[3]*2 + 1];
                }
            }
            callback(vertices, normals, uvs);
        };

        var xhrFile = new goog.net.XhrIo();
        goog.events.listen(xhrFile, goog.net.EventType.COMPLETE, function() {
            verticesText = this.getResponseText();

            if(oneCompleted) parse();
            else oneCompleted = true;
        });
        xhrFile.send(verticesFile);

        var xhrFaces = new goog.net.XhrIo();
        goog.events.listen(xhrFaces, goog.net.EventType.COMPLETE, function() {
            facesText = this.getResponseText();

            if(oneCompleted) parse();
            else oneCompleted = true;
        });
        xhrFaces.send(facesFile);

    };
};