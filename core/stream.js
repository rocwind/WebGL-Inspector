(function () {

    function getTargetValue(useMirror, value) {
        if (value) {
            if (value.trackedObject) {
                return value.trackedObject.mirror;
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

    var StateCapture = function (gl) {
        this.gl = gl;

        var stateParameters = gli.info.stateParameters;
        for (var n = 0; n < stateParameters.length; n++) {
            var param = stateParameters[n];
            var value = param.getter(gl);
            this[param.value ? param.value : param.name] = value;
        }

        this.attribs = [];
        var attribEnums = [gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING, gl.VERTEX_ATTRIB_ARRAY_ENABLED, gl.VERTEX_ATTRIB_ARRAY_SIZE, gl.VERTEX_ATTRIB_ARRAY_STRIDE, gl.VERTEX_ATTRIB_ARRAY_TYPE, gl.VERTEX_ATTRIB_ARRAY_NORMALIZED, gl.CURRENT_VERTEX_ATTRIB];
        var maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        for (var n = 0; n < maxVertexAttribs; n++) {
            var values = {};
            for (var m in attribEnums) {
                values[attribEnums[m]] = gl.getVertexAttrib(n, attribEnums[m]);
            }
            values[0] = gl.getVertexAttribOffset(n, gl.VERTEX_ATTRIB_ARRAY_POINTER);
            this.attribs.push(values);
        }
    };
    StateCapture.prototype.clone = function () {
        var cloned = {};
        for (var k in this) {
            cloned[k] = this[k];
        }
        return cloned;
    };
    StateCapture.prototype.apply = function (gl, useMirrors) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, getTargetValue(useMirrors, this[gl.FRAMEBUFFER_BINDING]));
        gl.bindRenderbuffer(gl.RENDERBUFFER, getTargetValue(useMirrors, this[gl.RENDERBUFFER_BINDING]));

        gl.viewport(this[gl.VIEWPORT][0], this[gl.VIEWPORT][1], this[gl.VIEWPORT][2], this[gl.VIEWPORT][3]);

        var maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        for (var n = 0; n < maxTextureUnits; n++) {
            gl.activeTexture(gl.TEXTURE0 + n);
            if (this["TEXTURE_BINDING_2D_" + n]) {
                gl.bindTexture(gl.TEXTURE_2D, getTargetValue(useMirrors, this["TEXTURE_BINDING_2D_" + n]));
            } else {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, getTargetValue(useMirrors, this["TEXTURE_BINDING_CUBE_MAP_" + n]));
            }
        }

        gl.activeTexture(this[gl.ACTIVE_TEXTURE]);

        gl.clearColor(this[gl.COLOR_CLEAR_VALUE][0], this[gl.COLOR_CLEAR_VALUE][1], this[gl.COLOR_CLEAR_VALUE][2], this[gl.COLOR_CLEAR_VALUE][3]);
        gl.colorMask(this[gl.COLOR_WRITEMASK][0], this[gl.COLOR_WRITEMASK][1], this[gl.COLOR_WRITEMASK][2], this[gl.COLOR_WRITEMASK][3]);

        if (this[gl.DEPTH_TEST]) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }
        gl.clearDepth(this[gl.DEPTH_CLEAR_VALUE]);
        gl.depthFunc(this[gl.DEPTH_FUNC]);
        gl.depthRange(this[gl.DEPTH_RANGE][0], this[gl.DEPTH_RANGE][1]);
        gl.depthMask(this[gl.DEPTH_WRITEMASK]);

        if (this[gl.BLEND]) {
            gl.enable(gl.BLEND);
        } else {
            gl.disable(gl.BLEND);
        }
        gl.blendColor(this[gl.BLEND_COLOR][0], this[gl.BLEND_COLOR][1], this[gl.BLEND_COLOR][2], this[gl.BLEND_COLOR][3]);
        gl.blendEquationSeparate(this[gl.BLEND_EQUATION_RGB], this[gl.BLEND_EQUATION_ALPHA]);
        gl.blendFuncSeparate(this[gl.BLEND_SRC_RGB], this[gl.BLEND_DST_RGB], this[gl.BLEND_SRC_ALPHA], this[gl.BLEND_DST_ALPHA]);

        //gl.DITHER, // ??????????????????????????????????????????????????????????

        if (this[gl.CULL_FACE]) {
            gl.enable(gl.CULL_FACE);
        } else {
            gl.disable(gl.CULL_FACE);
        }
        gl.cullFace(this[gl.CULL_FACE_MODE]);
        gl.frontFace(this[gl.FRONT_FACE]);

        gl.lineWidth(this[gl.LINE_WIDTH]);

        if (this[gl.POLYGON_OFFSET_FILL]) {
            gl.enable(gl.POLYGON_OFFSET_FILL);
        } else {
            gl.disable(gl.POLYGON_OFFSET_FILL);
        }
        gl.polygonOffset(this[gl.POLYGON_OFFSET_FACTOR], this[gl.POLYGON_OFFSET_UNITS]);

        if (this[gl.SAMPLE_COVERAGE]) {
            gl.enable(gl.SAMPLE_COVERAGE);
        } else {
            gl.disable(gl.SAMPLE_COVERAGE);
        }
        if (this[gl.SAMPLE_ALPHA_TO_COVERAGE]) {
            gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
        } else {
            gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
        }
        gl.sampleCoverage(this[gl.SAMPLE_COVERAGE_VALUE], this[gl.SAMPLE_COVERAGE_INVERT]);

        if (this[gl.SCISSOR_TEST]) {
            gl.enable(gl.SCISSOR_TEST);
        } else {
            gl.disable(gl.SCISSOR_TEST);
        }
        gl.scissor(this[gl.SCISSOR_BOX][0], this[gl.SCISSOR_BOX][1], this[gl.SCISSOR_BOX][2], this[gl.SCISSOR_BOX][3]);

        if (this[gl.STENCIL_TEST]) {
            gl.enable(gl.STENCIL_TEST);
        } else {
            gl.disable(gl.STENCIL_TEST);
        }
        gl.clearStencil(this[gl.STENCIL_CLEAR_VALUE]);
        gl.stencilFuncSeparate(gl.FRONT, this[gl.STENCIL_FUNC], this[gl.STENCIL_REF], this[gl.STENCIL_VALUE_MASK]);
        gl.stencilFuncSeparate(gl.FRONT, this[gl.STENCIL_BACK_FUNC], this[gl.STENCIL_BACK_REF], this[gl.STENCIL_VALUE_BACK_MASK]);
        gl.stencilOpSeparate(gl.FRONT, this[gl.STENCIL_FAIL], this[gl.STENCIL_PASS_DEPTH_FAIL], this[gl.STENCIL_PASS_DEPTH_PASS]);
        gl.stencilOpSeparate(gl.BACK, this[gl.STENCIL_BACK_FAIL], this[gl.STENCIL_BACK_PASS_DEPTH_FAIL], this[gl.STENCIL_BACK_PASS_DEPTH_PASS]);
        gl.stencilMaskSeparate(this[gl.STENCIL_WRITEMASK], this[gl.STENCIL_BACK_WRITEMASK]);

        gl.hint(gl.GENERATE_MIPMAP_HINT, this[gl.GENERATE_MIPMAP_HINT]);

        gl.pixelStorei(gl.PACK_ALIGNMENT, this[gl.PACK_ALIGNMENT]);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, this[gl.UNPACK_ALIGNMENT]);
        //gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this[gl.UNPACK_COLORSPACE_CONVERSION_WEBGL]); ////////////////////// NOT YET SUPPORTED IN SOME BROWSERS
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this[gl.UNPACK_FLIP_Y_WEBGL]);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this[gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL]);

        gl.useProgram(getTargetValue(useMirrors, this[gl.CURRENT_PROGRAM]));

        for (var n = 0; n < this.attribs.length; n++) {
            var values = this.attribs[n];
            if (values[gl.VERTEX_ATTRIB_ARRAY_ENABLED]) {
                gl.enableVertexAttribArray(n);
            } else {
                gl.disableVertexAttribArray(n);
            }
            gl.vertexAttrib4fv(n, values[gl.CURRENT_VERTEX_ATTRIB]);
            gl.bindBuffer(gl.ARRAY_BUFFER, getTargetValue(useMirrors, values[gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING]));
            gl.vertexAttribPointer(n, values[gl.VERTEX_ATTRIB_ARRAY_SIZE], values[gl.VERTEX_ATTRIB_ARRAY_TYPE], values[gl.VERTEX_ATTRIB_ARRAY_NORMALIZED], values[gl.VERTEX_ATTRIB_ARRAY_STRIDE], values[0]);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, getTargetValue(useMirrors, this[gl.ARRAY_BUFFER_BINDING]));
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, getTargetValue(useMirrors, this[gl.ELEMENT_ARRAY_BUFFER_BINDING]));
    };

    function isWebGLResource(value) {
        var typename = value.constructor.toString();
        if ((typename.indexOf("WebGLBuffer") >= 0) ||
            (typename.indexOf("WebGLFramebuffer") >= 0) ||
            (typename.indexOf("WebGLProgram") >= 0) ||
            (typename.indexOf("WebGLRenderbuffer") >= 0) ||
            (typename.indexOf("WebGLShader") >= 0) ||
            (typename.indexOf("WebGLTexture") >= 0)) {
            return true;
        } else {
            return false;
        }
    }

    var Frame = function (gl, frameNumber) {
        this.gl = gl;
        this.frameNumber = frameNumber;
        this.initialState = new StateCapture(gl);
        this.finalState = null;

        this.resourcesRead = [];
        this.resourcesWritten = [];

        // TODO: preallocate better/etc
        this.calls = [];

        // Grab all resources set as state
        for (var n in this.initialState) {
            var value = this.initialState[n];
            if (value && isWebGLResource(value)) {
                this.markResourceAccess(value.trackedObject);
            }
        }
    };
    Frame.prototype.end = function () {
        this.finalState = new StateCapture(gl);
    };
    Frame.prototype.allocateCall = function (fn, info) {
        var call = new Call(fn, info);
        this.calls.push(call);
        return call;
    };
    Frame.prototype.markResourceAccess = function (resource) {
        if (this.resourcesRead.indexOf(resource) == -1) {
            this.resourcesRead.push(resource);
        }
    };

    var Call = function (fn, info) {
        this.time = (new Date()).getTime();
        this.duration = 0;

        this.fn = fn;
        this.info = info;
        this.args = [];
        this.result = null;
    };
    Call.prototype.complete = function (result) {
        this.duration = (new Date()).getTime() - this.time;
        this.result = result;
    };

    function generateRecordFunction(stream, context, functionName, realFunction) {
        return function (args) {
            var call = stream.currentFrame.allocateCall(realFunction, gli.info.functions[functionName]);
            call.args.length = args.length;

            for (var n = 0; n < args.length; n++) {
                // Need to clone certain arguments as the application may change them immediately after the call and we want the value that was sent to GL
                call.args[n] = gli.util.clone(args[n]);

                if (call.args[n] && isWebGLResource(call.args[n])) {
                    stream.currentFrame.markResourceAccess(call.args[n].trackedObject);
                }
            }

            return call;
        };
    };

    function generateReplayFunction(stream, context, functionName, realFunction) {
        return function (call) {
            realFunction.apply(context.innerContext, call.args);
        };
    };

    function getTrackedTexture(gl, args) {
        var bindingEnum;
        switch (args[0]) {
            case gl.TEXTURE_2D:
                bindingEnum = gl.TEXTURE_BINDING_2D;
                break;
            case gl.TEXTURE_CUBE_MAP:
                bindingEnum = gl.TEXTURE_BINDING_CUBE_MAP;
                break;
        }
        var gltexture = gl.getParameter(bindingEnum);
        if (gltexture == null) {
            // Going to fail
            return null;
        }
        return gltexture.trackedObject;
    };

    function getTrackedBuffer(gl, args) {
        var bindingEnum;
        switch (args[0]) {
            case gl.ARRAY_BUFFER:
                bindingEnum = gl.ARRAY_BUFFER_BINDING;
                break;
            case gl.ELEMENT_ARRAY_BUFFER:
                bindingEnum = gl.ELEMENT_ARRAY_BUFFER_BINDING;
                break;
        }
        var glbuffer = gl.getParameter(bindingEnum);
        if (glbuffer == null) {
            // Going to fail
            return null;
        }
        return glbuffer.trackedObject;
    };

    var __resourceTrackingId = 1;
    function registerResource(stream, resource) {
        resource.id = __resourceTrackingId++;
        stream.resources.push(resource);
    };

    function setupResourceCaptures(stream, context, resourceCaptures) {
        var gl = context.innerContext;

        // pre-call:
        // fn(args)
        // post-call:
        // fn(args, result)

        // Framebuffers
        //resourceCaptures[""] = function (args, result) {
        //};

        // Renderbuffers
        //resourceCaptures[""] = function (args, result) {
        //};

        // Programs
        resourceCaptures["createProgram"] = function (args, result) {
            if (arguments.length == 1) {
            } else {
                // result = new WebGLProgram
                var program = new gli.Program(gl, result);
                registerResource(stream, program);
            }
        };
        resourceCaptures["deleteProgram"] = function (args, result) {
            // args[0] = program
            if (arguments.length == 1) {
                var program = args[0].trackedObject;
                program.refresh();
                program.markDead();
            } else {
            }
        };
        resourceCaptures["attachShader"] = function (args, result) {
            // args[0] = program
            // args[1] = shader
            var program = args[0].trackedObject;
            if (arguments.length == 1) {
            } else {
                program.refresh();
            }
        };
        resourceCaptures["detachShader"] = function (args, result) {
            // args[0] = program
            // args[1] = shader
            var program = args[0].trackedObject;
            if (arguments.length == 1) {
            } else {
                program.refresh();
            }
        };
        resourceCaptures["linkProgram"] = function (args, result) {
            // args[0] = program
            var program = args[0].trackedObject;
            if (arguments.length == 1) {
            } else {
                program.refresh();
            }
        };
        resourceCaptures["bindAttribLocation"] = function (args, result) {
            // args[0] = program
            // args[1] = index
            // args[2] = name
            var program = args[0].trackedObject;
            if (arguments.length == 1) {
            } else {
                program.refresh();
            }
        };

        // Shaders
        resourceCaptures["createShader"] = function (args, result) {
            // (GLenum type)
            if (arguments.length == 1) {
            } else {
                // result = new WebGLShader
                var shader = new gli.Shader(gl, result, args[0]);
                registerResource(stream, shader);
            }
        };
        resourceCaptures["deleteShader"] = function (args, result) {
            // args[0] = shader
            if (arguments.length == 1) {
                var shader = args[0].trackedObject;
                shader.refresh();
                shader.markDead();
            } else {
            }
        };
        resourceCaptures["compileShader"] = function (args, result) {
            // args[0] = shader
            var shader = args[0].trackedObject;
            if (arguments.length == 1) {
            } else {
                shader.refresh();
            }
        };
        resourceCaptures["shaderSource"] = function (args, result) {
            // args[0] = shader
            // args[1] = source
            var shader = args[0].trackedObject;
            if (arguments.length == 1) {
                shader.setSource(args[1]);
            } else {
                shader.refresh();
            }
        };

        // Textures
        // TODO: copyTexImage2D
        // TODO: copyTexSubImage2D
        resourceCaptures["createTexture"] = function (args, result) {
            if (arguments.length == 1) {
            } else {
                // result = new WebGLTexture
                var texture = new gli.Texture(gl, result);
                registerResource(stream, texture);
            }
        };
        resourceCaptures["deleteTexture"] = function (args, result) {
            // args[0] = texture
            if (arguments.length == 1) {
                var texture = args[0].trackedObject;
                texture.refresh();
                texture.markDead();
            } else {
            }
        };
        resourceCaptures["generateMipmap"] = function (args, result) {
            // (GLenum target)
            var texture = getTrackedTexture(gl, args);
            if (arguments.length == 1) {
                // ?
            } else {
                texture.refresh();
            }
        };
        resourceCaptures["texParameterf"] = resourceCaptures["texParameteri"] = function (args, result) {
            // (GLenum target, GLenum pname, GLfloat/GLint param)
            var texture = getTrackedTexture(gl, args);
            if (arguments.length == 1) {
                // ?
            } else {
                texture.refresh();
            }
        };
        resourceCaptures["texImage2D"] = function (args, result) {
            // (GLenum target, GLint level, GLenum internalformat, GLsizei width, GLsizei height, GLint border, GLenum format, GLenum type, ArrayBufferView pixels)
            // (GLenum target, GLint level, GLenum internalformat, GLenum format, GLenum type, ImageData pixels)
            // (GLenum target, GLint level, GLenum internalformat, GLenum format, GLenum type, HTMLImageElement image)
            // (GLenum target, GLint level, GLenum internalformat, GLenum format, GLenum type, HTMLCanvasElement canvas)
            // (GLenum target, GLint level, GLenum internalformat, GLenum format, GLenum type, HTMLVideoElement video)
            var texture = getTrackedTexture(gl, args);
            if (arguments.length == 1) {
                if (args.length == 9) {
                    texture.setDataRaw.apply(texture, args);
                } else {
                    texture.setData.apply(texture, args);
                }
            } else {
                texture.refresh();
            }
        };
        resourceCaptures["texSubImage2D"] = function (args, result) {
            // (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLsizei width, GLsizei height, GLenum format, GLenum type, ArrayBufferView pixels)
            // (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLenum format, GLenum type, ImageData pixels)
            // (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLenum format, GLenum type, HTMLImageElement image)
            // (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLenum format, GLenum type, HTMLCanvasElement canvas)
            // (GLenum target, GLint level, GLint xoffset, GLint yoffset, GLenum format, GLenum type, HTMLVideoElement video)
            var texture = getTrackedTexture(gl, args);
            if (arguments.length == 1) {
                if (args.length == 9) {
                    texture.setSubDataRaw.apply(texture, args);
                } else {
                    texture.setSubData.apply(texture, args);
                }
            } else {
                texture.refresh();
            }
        };

        // Buffers
        resourceCaptures["createBuffer"] = function (args, result) {
            if (arguments.length == 1) {
            } else {
                // result = new WebGLBuffer
                var buffer = new gli.Buffer(gl, result);
                registerResource(stream, buffer);
            }
        };
        resourceCaptures["deleteBuffer"] = function (args, result) {
            // args[0] = buffer
            if (arguments.length == 1) {
                var buffer = args[0].trackedObject;
                buffer.refresh();
                buffer.markDead();
            } else {
            }
        };
        resourceCaptures["bufferData"] = function (args, result) {
            // (GLenum target, GLsizei size, GLenum usage)
            // (GLenum target, ArrayBufferView data, GLenum usage)
            // (GLenum target, ArrayBuffer data, GLenum usage)
            var buffer = getTrackedBuffer(gl, args);
            if (arguments.length == 1) {
                buffer.setData.apply(buffer, args);
            } else {
                buffer.refresh();
            }
        };
        resourceCaptures["bufferSubData"] = function (args, result) {
            // (GLenum target, GLsizeiptr offset, ArrayBufferView data)
            // (GLenum target, GLsizeiptr offset, ArrayBuffer data)
            var buffer = getTrackedBuffer(gl, args);
            if (arguments.length == 1) {
                buffer.setSubData.apply(buffer, args);
            } else {
                buffer.refresh();
            }
        };
    };

    var Stream = function (context) {
        this.context = context;

        this.frames = [];
        this.currentFrame = null;

        this.resources = [];

        this.resourceCaptures = {};
        this.recorders = {};
        this.replayers = {};

        // For each function in the inner context generate our custom thunks (record/playback)
        for (var propertyName in context.innerContext) {
            if (typeof context.innerContext[propertyName] == 'function') {
                this.recorders[propertyName] = generateRecordFunction(this, context, propertyName, context.innerContext[propertyName]);
                this.replayers[propertyName] = generateReplayFunction(this, context, propertyName, context.innerContext[propertyName]);
            }
        }

        // Specific resource capture routines
        setupResourceCaptures(this, context, this.resourceCaptures);
    };

    Stream.prototype.reset = function () {
        // TODO: other?
        for (var category in this.objects) {
            this.objects[category].reset();
        }
        this.frames.length = 0;
        this.currentFrame = null;
    };

    Stream.prototype.markFrame = function (frameNumber) {
        if (this.currentFrame) {
            // Close the previous frame
            this.currentFrame.end();
            this.currentFrame = null;
        }

        if (frameNumber == null) {
            // Abort if not a real frame
            return;
        }

        var frame = new Frame(this.context.innerContext, frameNumber);
        this.frames.push(frame);
        this.currentFrame = frame;
    };

    Stream.prototype.preparePlayback = function () {
        // Restore all objects to their initial values
        //        for (var category in stream.objects) {
        //            stream.objects[category].restoreInitialValues();
        //        }
    }

    gli.Stream = Stream;

    // DEBUG:
    gli.StateCapture = StateCapture;
})();
