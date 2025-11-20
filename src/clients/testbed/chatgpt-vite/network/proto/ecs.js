/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const u2 = $root.u2 = (() => {

    /**
     * Namespace u2.
     * @exports u2
     * @namespace
     */
    const u2 = {};

    u2.shared = (function() {

        /**
         * Namespace shared.
         * @memberof u2
         * @namespace
         */
        const shared = {};

        shared.proto = (function() {

            /**
             * Namespace proto.
             * @memberof u2.shared
             * @namespace
             */
            const proto = {};

            proto.Vector2Proto = (function() {

                /**
                 * Properties of a Vector2Proto.
                 * @memberof u2.shared.proto
                 * @interface IVector2Proto
                 * @property {number|null} [x] Vector2Proto x
                 * @property {number|null} [y] Vector2Proto y
                 */

                /**
                 * Constructs a new Vector2Proto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a Vector2Proto.
                 * @implements IVector2Proto
                 * @constructor
                 * @param {u2.shared.proto.IVector2Proto=} [properties] Properties to set
                 */
                function Vector2Proto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Vector2Proto x.
                 * @member {number} x
                 * @memberof u2.shared.proto.Vector2Proto
                 * @instance
                 */
                Vector2Proto.prototype.x = 0;

                /**
                 * Vector2Proto y.
                 * @member {number} y
                 * @memberof u2.shared.proto.Vector2Proto
                 * @instance
                 */
                Vector2Proto.prototype.y = 0;

                /**
                 * Creates a new Vector2Proto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.Vector2Proto
                 * @static
                 * @param {u2.shared.proto.IVector2Proto=} [properties] Properties to set
                 * @returns {u2.shared.proto.Vector2Proto} Vector2Proto instance
                 */
                Vector2Proto.create = function create(properties) {
                    return new Vector2Proto(properties);
                };

                /**
                 * Encodes the specified Vector2Proto message. Does not implicitly {@link u2.shared.proto.Vector2Proto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.Vector2Proto
                 * @static
                 * @param {u2.shared.proto.IVector2Proto} message Vector2Proto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Vector2Proto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.x);
                    if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.y);
                    return writer;
                };

                /**
                 * Encodes the specified Vector2Proto message, length delimited. Does not implicitly {@link u2.shared.proto.Vector2Proto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.Vector2Proto
                 * @static
                 * @param {u2.shared.proto.IVector2Proto} message Vector2Proto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Vector2Proto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Vector2Proto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.Vector2Proto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.Vector2Proto} Vector2Proto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Vector2Proto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.Vector2Proto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.x = reader.float();
                                break;
                            }
                        case 2: {
                                message.y = reader.float();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Vector2Proto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.Vector2Proto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.Vector2Proto} Vector2Proto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Vector2Proto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Vector2Proto message.
                 * @function verify
                 * @memberof u2.shared.proto.Vector2Proto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Vector2Proto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.x != null && message.hasOwnProperty("x"))
                        if (typeof message.x !== "number")
                            return "x: number expected";
                    if (message.y != null && message.hasOwnProperty("y"))
                        if (typeof message.y !== "number")
                            return "y: number expected";
                    return null;
                };

                /**
                 * Creates a Vector2Proto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.Vector2Proto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.Vector2Proto} Vector2Proto
                 */
                Vector2Proto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.Vector2Proto)
                        return object;
                    let message = new $root.u2.shared.proto.Vector2Proto();
                    if (object.x != null)
                        message.x = Number(object.x);
                    if (object.y != null)
                        message.y = Number(object.y);
                    return message;
                };

                /**
                 * Creates a plain object from a Vector2Proto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.Vector2Proto
                 * @static
                 * @param {u2.shared.proto.Vector2Proto} message Vector2Proto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Vector2Proto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.x = 0;
                        object.y = 0;
                    }
                    if (message.x != null && message.hasOwnProperty("x"))
                        object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
                    if (message.y != null && message.hasOwnProperty("y"))
                        object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
                    return object;
                };

                /**
                 * Converts this Vector2Proto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.Vector2Proto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Vector2Proto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Vector2Proto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.Vector2Proto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Vector2Proto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.Vector2Proto";
                };

                return Vector2Proto;
            })();

            proto.Transform2DProto = (function() {

                /**
                 * Properties of a Transform2DProto.
                 * @memberof u2.shared.proto
                 * @interface ITransform2DProto
                 * @property {u2.shared.proto.IVector2Proto|null} [position] Transform2DProto position
                 * @property {number|null} [rotation] Transform2DProto rotation
                 */

                /**
                 * Constructs a new Transform2DProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a Transform2DProto.
                 * @implements ITransform2DProto
                 * @constructor
                 * @param {u2.shared.proto.ITransform2DProto=} [properties] Properties to set
                 */
                function Transform2DProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Transform2DProto position.
                 * @member {u2.shared.proto.IVector2Proto|null|undefined} position
                 * @memberof u2.shared.proto.Transform2DProto
                 * @instance
                 */
                Transform2DProto.prototype.position = null;

                /**
                 * Transform2DProto rotation.
                 * @member {number} rotation
                 * @memberof u2.shared.proto.Transform2DProto
                 * @instance
                 */
                Transform2DProto.prototype.rotation = 0;

                /**
                 * Creates a new Transform2DProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.Transform2DProto
                 * @static
                 * @param {u2.shared.proto.ITransform2DProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.Transform2DProto} Transform2DProto instance
                 */
                Transform2DProto.create = function create(properties) {
                    return new Transform2DProto(properties);
                };

                /**
                 * Encodes the specified Transform2DProto message. Does not implicitly {@link u2.shared.proto.Transform2DProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.Transform2DProto
                 * @static
                 * @param {u2.shared.proto.ITransform2DProto} message Transform2DProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Transform2DProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                        $root.u2.shared.proto.Vector2Proto.encode(message.position, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.rotation != null && Object.hasOwnProperty.call(message, "rotation"))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.rotation);
                    return writer;
                };

                /**
                 * Encodes the specified Transform2DProto message, length delimited. Does not implicitly {@link u2.shared.proto.Transform2DProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.Transform2DProto
                 * @static
                 * @param {u2.shared.proto.ITransform2DProto} message Transform2DProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Transform2DProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Transform2DProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.Transform2DProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.Transform2DProto} Transform2DProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Transform2DProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.Transform2DProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.position = $root.u2.shared.proto.Vector2Proto.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.rotation = reader.float();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Transform2DProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.Transform2DProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.Transform2DProto} Transform2DProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Transform2DProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Transform2DProto message.
                 * @function verify
                 * @memberof u2.shared.proto.Transform2DProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Transform2DProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.position != null && message.hasOwnProperty("position")) {
                        let error = $root.u2.shared.proto.Vector2Proto.verify(message.position);
                        if (error)
                            return "position." + error;
                    }
                    if (message.rotation != null && message.hasOwnProperty("rotation"))
                        if (typeof message.rotation !== "number")
                            return "rotation: number expected";
                    return null;
                };

                /**
                 * Creates a Transform2DProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.Transform2DProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.Transform2DProto} Transform2DProto
                 */
                Transform2DProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.Transform2DProto)
                        return object;
                    let message = new $root.u2.shared.proto.Transform2DProto();
                    if (object.position != null) {
                        if (typeof object.position !== "object")
                            throw TypeError(".u2.shared.proto.Transform2DProto.position: object expected");
                        message.position = $root.u2.shared.proto.Vector2Proto.fromObject(object.position);
                    }
                    if (object.rotation != null)
                        message.rotation = Number(object.rotation);
                    return message;
                };

                /**
                 * Creates a plain object from a Transform2DProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.Transform2DProto
                 * @static
                 * @param {u2.shared.proto.Transform2DProto} message Transform2DProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Transform2DProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.position = null;
                        object.rotation = 0;
                    }
                    if (message.position != null && message.hasOwnProperty("position"))
                        object.position = $root.u2.shared.proto.Vector2Proto.toObject(message.position, options);
                    if (message.rotation != null && message.hasOwnProperty("rotation"))
                        object.rotation = options.json && !isFinite(message.rotation) ? String(message.rotation) : message.rotation;
                    return object;
                };

                /**
                 * Converts this Transform2DProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.Transform2DProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Transform2DProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Transform2DProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.Transform2DProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Transform2DProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.Transform2DProto";
                };

                return Transform2DProto;
            })();

            proto.VelocityProto = (function() {

                /**
                 * Properties of a VelocityProto.
                 * @memberof u2.shared.proto
                 * @interface IVelocityProto
                 * @property {u2.shared.proto.IVector2Proto|null} [linear] VelocityProto linear
                 * @property {number|null} [angular] VelocityProto angular
                 */

                /**
                 * Constructs a new VelocityProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a VelocityProto.
                 * @implements IVelocityProto
                 * @constructor
                 * @param {u2.shared.proto.IVelocityProto=} [properties] Properties to set
                 */
                function VelocityProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * VelocityProto linear.
                 * @member {u2.shared.proto.IVector2Proto|null|undefined} linear
                 * @memberof u2.shared.proto.VelocityProto
                 * @instance
                 */
                VelocityProto.prototype.linear = null;

                /**
                 * VelocityProto angular.
                 * @member {number} angular
                 * @memberof u2.shared.proto.VelocityProto
                 * @instance
                 */
                VelocityProto.prototype.angular = 0;

                /**
                 * Creates a new VelocityProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.VelocityProto
                 * @static
                 * @param {u2.shared.proto.IVelocityProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.VelocityProto} VelocityProto instance
                 */
                VelocityProto.create = function create(properties) {
                    return new VelocityProto(properties);
                };

                /**
                 * Encodes the specified VelocityProto message. Does not implicitly {@link u2.shared.proto.VelocityProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.VelocityProto
                 * @static
                 * @param {u2.shared.proto.IVelocityProto} message VelocityProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                VelocityProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.linear != null && Object.hasOwnProperty.call(message, "linear"))
                        $root.u2.shared.proto.Vector2Proto.encode(message.linear, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.angular != null && Object.hasOwnProperty.call(message, "angular"))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.angular);
                    return writer;
                };

                /**
                 * Encodes the specified VelocityProto message, length delimited. Does not implicitly {@link u2.shared.proto.VelocityProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.VelocityProto
                 * @static
                 * @param {u2.shared.proto.IVelocityProto} message VelocityProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                VelocityProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a VelocityProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.VelocityProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.VelocityProto} VelocityProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                VelocityProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.VelocityProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.linear = $root.u2.shared.proto.Vector2Proto.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.angular = reader.float();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a VelocityProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.VelocityProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.VelocityProto} VelocityProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                VelocityProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a VelocityProto message.
                 * @function verify
                 * @memberof u2.shared.proto.VelocityProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                VelocityProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.linear != null && message.hasOwnProperty("linear")) {
                        let error = $root.u2.shared.proto.Vector2Proto.verify(message.linear);
                        if (error)
                            return "linear." + error;
                    }
                    if (message.angular != null && message.hasOwnProperty("angular"))
                        if (typeof message.angular !== "number")
                            return "angular: number expected";
                    return null;
                };

                /**
                 * Creates a VelocityProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.VelocityProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.VelocityProto} VelocityProto
                 */
                VelocityProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.VelocityProto)
                        return object;
                    let message = new $root.u2.shared.proto.VelocityProto();
                    if (object.linear != null) {
                        if (typeof object.linear !== "object")
                            throw TypeError(".u2.shared.proto.VelocityProto.linear: object expected");
                        message.linear = $root.u2.shared.proto.Vector2Proto.fromObject(object.linear);
                    }
                    if (object.angular != null)
                        message.angular = Number(object.angular);
                    return message;
                };

                /**
                 * Creates a plain object from a VelocityProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.VelocityProto
                 * @static
                 * @param {u2.shared.proto.VelocityProto} message VelocityProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                VelocityProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.linear = null;
                        object.angular = 0;
                    }
                    if (message.linear != null && message.hasOwnProperty("linear"))
                        object.linear = $root.u2.shared.proto.Vector2Proto.toObject(message.linear, options);
                    if (message.angular != null && message.hasOwnProperty("angular"))
                        object.angular = options.json && !isFinite(message.angular) ? String(message.angular) : message.angular;
                    return object;
                };

                /**
                 * Converts this VelocityProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.VelocityProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                VelocityProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for VelocityProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.VelocityProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                VelocityProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.VelocityProto";
                };

                return VelocityProto;
            })();

            proto.MassProto = (function() {

                /**
                 * Properties of a MassProto.
                 * @memberof u2.shared.proto
                 * @interface IMassProto
                 * @property {number|null} [massKg] MassProto massKg
                 * @property {number|null} [inertiaKgm2] MassProto inertiaKgm2
                 */

                /**
                 * Constructs a new MassProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a MassProto.
                 * @implements IMassProto
                 * @constructor
                 * @param {u2.shared.proto.IMassProto=} [properties] Properties to set
                 */
                function MassProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * MassProto massKg.
                 * @member {number} massKg
                 * @memberof u2.shared.proto.MassProto
                 * @instance
                 */
                MassProto.prototype.massKg = 0;

                /**
                 * MassProto inertiaKgm2.
                 * @member {number} inertiaKgm2
                 * @memberof u2.shared.proto.MassProto
                 * @instance
                 */
                MassProto.prototype.inertiaKgm2 = 0;

                /**
                 * Creates a new MassProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.MassProto
                 * @static
                 * @param {u2.shared.proto.IMassProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.MassProto} MassProto instance
                 */
                MassProto.create = function create(properties) {
                    return new MassProto(properties);
                };

                /**
                 * Encodes the specified MassProto message. Does not implicitly {@link u2.shared.proto.MassProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.MassProto
                 * @static
                 * @param {u2.shared.proto.IMassProto} message MassProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MassProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.massKg != null && Object.hasOwnProperty.call(message, "massKg"))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.massKg);
                    if (message.inertiaKgm2 != null && Object.hasOwnProperty.call(message, "inertiaKgm2"))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.inertiaKgm2);
                    return writer;
                };

                /**
                 * Encodes the specified MassProto message, length delimited. Does not implicitly {@link u2.shared.proto.MassProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.MassProto
                 * @static
                 * @param {u2.shared.proto.IMassProto} message MassProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MassProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a MassProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.MassProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.MassProto} MassProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MassProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.MassProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.massKg = reader.float();
                                break;
                            }
                        case 2: {
                                message.inertiaKgm2 = reader.float();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a MassProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.MassProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.MassProto} MassProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MassProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a MassProto message.
                 * @function verify
                 * @memberof u2.shared.proto.MassProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                MassProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.massKg != null && message.hasOwnProperty("massKg"))
                        if (typeof message.massKg !== "number")
                            return "massKg: number expected";
                    if (message.inertiaKgm2 != null && message.hasOwnProperty("inertiaKgm2"))
                        if (typeof message.inertiaKgm2 !== "number")
                            return "inertiaKgm2: number expected";
                    return null;
                };

                /**
                 * Creates a MassProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.MassProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.MassProto} MassProto
                 */
                MassProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.MassProto)
                        return object;
                    let message = new $root.u2.shared.proto.MassProto();
                    if (object.massKg != null)
                        message.massKg = Number(object.massKg);
                    if (object.inertiaKgm2 != null)
                        message.inertiaKgm2 = Number(object.inertiaKgm2);
                    return message;
                };

                /**
                 * Creates a plain object from a MassProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.MassProto
                 * @static
                 * @param {u2.shared.proto.MassProto} message MassProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                MassProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.massKg = 0;
                        object.inertiaKgm2 = 0;
                    }
                    if (message.massKg != null && message.hasOwnProperty("massKg"))
                        object.massKg = options.json && !isFinite(message.massKg) ? String(message.massKg) : message.massKg;
                    if (message.inertiaKgm2 != null && message.hasOwnProperty("inertiaKgm2"))
                        object.inertiaKgm2 = options.json && !isFinite(message.inertiaKgm2) ? String(message.inertiaKgm2) : message.inertiaKgm2;
                    return object;
                };

                /**
                 * Converts this MassProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.MassProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                MassProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for MassProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.MassProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                MassProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.MassProto";
                };

                return MassProto;
            })();

            proto.ControlStateProto = (function() {

                /**
                 * Properties of a ControlStateProto.
                 * @memberof u2.shared.proto
                 * @interface IControlStateProto
                 * @property {number|null} [thrust] ControlStateProto thrust
                 * @property {number|null} [strafeX] ControlStateProto strafeX
                 * @property {number|null} [strafeY] ControlStateProto strafeY
                 * @property {number|null} [yawInput] ControlStateProto yawInput
                 */

                /**
                 * Constructs a new ControlStateProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a ControlStateProto.
                 * @implements IControlStateProto
                 * @constructor
                 * @param {u2.shared.proto.IControlStateProto=} [properties] Properties to set
                 */
                function ControlStateProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ControlStateProto thrust.
                 * @member {number} thrust
                 * @memberof u2.shared.proto.ControlStateProto
                 * @instance
                 */
                ControlStateProto.prototype.thrust = 0;

                /**
                 * ControlStateProto strafeX.
                 * @member {number} strafeX
                 * @memberof u2.shared.proto.ControlStateProto
                 * @instance
                 */
                ControlStateProto.prototype.strafeX = 0;

                /**
                 * ControlStateProto strafeY.
                 * @member {number} strafeY
                 * @memberof u2.shared.proto.ControlStateProto
                 * @instance
                 */
                ControlStateProto.prototype.strafeY = 0;

                /**
                 * ControlStateProto yawInput.
                 * @member {number} yawInput
                 * @memberof u2.shared.proto.ControlStateProto
                 * @instance
                 */
                ControlStateProto.prototype.yawInput = 0;

                /**
                 * Creates a new ControlStateProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.ControlStateProto
                 * @static
                 * @param {u2.shared.proto.IControlStateProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.ControlStateProto} ControlStateProto instance
                 */
                ControlStateProto.create = function create(properties) {
                    return new ControlStateProto(properties);
                };

                /**
                 * Encodes the specified ControlStateProto message. Does not implicitly {@link u2.shared.proto.ControlStateProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.ControlStateProto
                 * @static
                 * @param {u2.shared.proto.IControlStateProto} message ControlStateProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ControlStateProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.thrust != null && Object.hasOwnProperty.call(message, "thrust"))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.thrust);
                    if (message.strafeX != null && Object.hasOwnProperty.call(message, "strafeX"))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.strafeX);
                    if (message.strafeY != null && Object.hasOwnProperty.call(message, "strafeY"))
                        writer.uint32(/* id 3, wireType 5 =*/29).float(message.strafeY);
                    if (message.yawInput != null && Object.hasOwnProperty.call(message, "yawInput"))
                        writer.uint32(/* id 4, wireType 5 =*/37).float(message.yawInput);
                    return writer;
                };

                /**
                 * Encodes the specified ControlStateProto message, length delimited. Does not implicitly {@link u2.shared.proto.ControlStateProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.ControlStateProto
                 * @static
                 * @param {u2.shared.proto.IControlStateProto} message ControlStateProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ControlStateProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ControlStateProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.ControlStateProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.ControlStateProto} ControlStateProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ControlStateProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.ControlStateProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.thrust = reader.float();
                                break;
                            }
                        case 2: {
                                message.strafeX = reader.float();
                                break;
                            }
                        case 3: {
                                message.strafeY = reader.float();
                                break;
                            }
                        case 4: {
                                message.yawInput = reader.float();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ControlStateProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.ControlStateProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.ControlStateProto} ControlStateProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ControlStateProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ControlStateProto message.
                 * @function verify
                 * @memberof u2.shared.proto.ControlStateProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ControlStateProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.thrust != null && message.hasOwnProperty("thrust"))
                        if (typeof message.thrust !== "number")
                            return "thrust: number expected";
                    if (message.strafeX != null && message.hasOwnProperty("strafeX"))
                        if (typeof message.strafeX !== "number")
                            return "strafeX: number expected";
                    if (message.strafeY != null && message.hasOwnProperty("strafeY"))
                        if (typeof message.strafeY !== "number")
                            return "strafeY: number expected";
                    if (message.yawInput != null && message.hasOwnProperty("yawInput"))
                        if (typeof message.yawInput !== "number")
                            return "yawInput: number expected";
                    return null;
                };

                /**
                 * Creates a ControlStateProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.ControlStateProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.ControlStateProto} ControlStateProto
                 */
                ControlStateProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.ControlStateProto)
                        return object;
                    let message = new $root.u2.shared.proto.ControlStateProto();
                    if (object.thrust != null)
                        message.thrust = Number(object.thrust);
                    if (object.strafeX != null)
                        message.strafeX = Number(object.strafeX);
                    if (object.strafeY != null)
                        message.strafeY = Number(object.strafeY);
                    if (object.yawInput != null)
                        message.yawInput = Number(object.yawInput);
                    return message;
                };

                /**
                 * Creates a plain object from a ControlStateProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.ControlStateProto
                 * @static
                 * @param {u2.shared.proto.ControlStateProto} message ControlStateProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ControlStateProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.thrust = 0;
                        object.strafeX = 0;
                        object.strafeY = 0;
                        object.yawInput = 0;
                    }
                    if (message.thrust != null && message.hasOwnProperty("thrust"))
                        object.thrust = options.json && !isFinite(message.thrust) ? String(message.thrust) : message.thrust;
                    if (message.strafeX != null && message.hasOwnProperty("strafeX"))
                        object.strafeX = options.json && !isFinite(message.strafeX) ? String(message.strafeX) : message.strafeX;
                    if (message.strafeY != null && message.hasOwnProperty("strafeY"))
                        object.strafeY = options.json && !isFinite(message.strafeY) ? String(message.strafeY) : message.strafeY;
                    if (message.yawInput != null && message.hasOwnProperty("yawInput"))
                        object.yawInput = options.json && !isFinite(message.yawInput) ? String(message.yawInput) : message.yawInput;
                    return object;
                };

                /**
                 * Converts this ControlStateProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.ControlStateProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ControlStateProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ControlStateProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.ControlStateProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ControlStateProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.ControlStateProto";
                };

                return ControlStateProto;
            })();

            proto.FlightAssistProto = (function() {

                /**
                 * Properties of a FlightAssistProto.
                 * @memberof u2.shared.proto
                 * @interface IFlightAssistProto
                 * @property {boolean|null} [enabled] FlightAssistProto enabled
                 */

                /**
                 * Constructs a new FlightAssistProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a FlightAssistProto.
                 * @implements IFlightAssistProto
                 * @constructor
                 * @param {u2.shared.proto.IFlightAssistProto=} [properties] Properties to set
                 */
                function FlightAssistProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * FlightAssistProto enabled.
                 * @member {boolean} enabled
                 * @memberof u2.shared.proto.FlightAssistProto
                 * @instance
                 */
                FlightAssistProto.prototype.enabled = false;

                /**
                 * Creates a new FlightAssistProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.FlightAssistProto
                 * @static
                 * @param {u2.shared.proto.IFlightAssistProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.FlightAssistProto} FlightAssistProto instance
                 */
                FlightAssistProto.create = function create(properties) {
                    return new FlightAssistProto(properties);
                };

                /**
                 * Encodes the specified FlightAssistProto message. Does not implicitly {@link u2.shared.proto.FlightAssistProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.FlightAssistProto
                 * @static
                 * @param {u2.shared.proto.IFlightAssistProto} message FlightAssistProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FlightAssistProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.enabled != null && Object.hasOwnProperty.call(message, "enabled"))
                        writer.uint32(/* id 1, wireType 0 =*/8).bool(message.enabled);
                    return writer;
                };

                /**
                 * Encodes the specified FlightAssistProto message, length delimited. Does not implicitly {@link u2.shared.proto.FlightAssistProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.FlightAssistProto
                 * @static
                 * @param {u2.shared.proto.IFlightAssistProto} message FlightAssistProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FlightAssistProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a FlightAssistProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.FlightAssistProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.FlightAssistProto} FlightAssistProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FlightAssistProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.FlightAssistProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.enabled = reader.bool();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a FlightAssistProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.FlightAssistProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.FlightAssistProto} FlightAssistProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FlightAssistProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FlightAssistProto message.
                 * @function verify
                 * @memberof u2.shared.proto.FlightAssistProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FlightAssistProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.enabled != null && message.hasOwnProperty("enabled"))
                        if (typeof message.enabled !== "boolean")
                            return "enabled: boolean expected";
                    return null;
                };

                /**
                 * Creates a FlightAssistProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.FlightAssistProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.FlightAssistProto} FlightAssistProto
                 */
                FlightAssistProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.FlightAssistProto)
                        return object;
                    let message = new $root.u2.shared.proto.FlightAssistProto();
                    if (object.enabled != null)
                        message.enabled = Boolean(object.enabled);
                    return message;
                };

                /**
                 * Creates a plain object from a FlightAssistProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.FlightAssistProto
                 * @static
                 * @param {u2.shared.proto.FlightAssistProto} message FlightAssistProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FlightAssistProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        object.enabled = false;
                    if (message.enabled != null && message.hasOwnProperty("enabled"))
                        object.enabled = message.enabled;
                    return object;
                };

                /**
                 * Converts this FlightAssistProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.FlightAssistProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FlightAssistProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FlightAssistProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.FlightAssistProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FlightAssistProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.FlightAssistProto";
                };

                return FlightAssistProto;
            })();

            proto.HealthProto = (function() {

                /**
                 * Properties of a HealthProto.
                 * @memberof u2.shared.proto
                 * @interface IHealthProto
                 * @property {number|null} [currentHp] HealthProto currentHp
                 * @property {number|null} [maxHp] HealthProto maxHp
                 */

                /**
                 * Constructs a new HealthProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a HealthProto.
                 * @implements IHealthProto
                 * @constructor
                 * @param {u2.shared.proto.IHealthProto=} [properties] Properties to set
                 */
                function HealthProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * HealthProto currentHp.
                 * @member {number} currentHp
                 * @memberof u2.shared.proto.HealthProto
                 * @instance
                 */
                HealthProto.prototype.currentHp = 0;

                /**
                 * HealthProto maxHp.
                 * @member {number} maxHp
                 * @memberof u2.shared.proto.HealthProto
                 * @instance
                 */
                HealthProto.prototype.maxHp = 0;

                /**
                 * Creates a new HealthProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.HealthProto
                 * @static
                 * @param {u2.shared.proto.IHealthProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.HealthProto} HealthProto instance
                 */
                HealthProto.create = function create(properties) {
                    return new HealthProto(properties);
                };

                /**
                 * Encodes the specified HealthProto message. Does not implicitly {@link u2.shared.proto.HealthProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.HealthProto
                 * @static
                 * @param {u2.shared.proto.IHealthProto} message HealthProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                HealthProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.currentHp != null && Object.hasOwnProperty.call(message, "currentHp"))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.currentHp);
                    if (message.maxHp != null && Object.hasOwnProperty.call(message, "maxHp"))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.maxHp);
                    return writer;
                };

                /**
                 * Encodes the specified HealthProto message, length delimited. Does not implicitly {@link u2.shared.proto.HealthProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.HealthProto
                 * @static
                 * @param {u2.shared.proto.IHealthProto} message HealthProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                HealthProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a HealthProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.HealthProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.HealthProto} HealthProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                HealthProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.HealthProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.currentHp = reader.float();
                                break;
                            }
                        case 2: {
                                message.maxHp = reader.float();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a HealthProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.HealthProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.HealthProto} HealthProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                HealthProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a HealthProto message.
                 * @function verify
                 * @memberof u2.shared.proto.HealthProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                HealthProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.currentHp != null && message.hasOwnProperty("currentHp"))
                        if (typeof message.currentHp !== "number")
                            return "currentHp: number expected";
                    if (message.maxHp != null && message.hasOwnProperty("maxHp"))
                        if (typeof message.maxHp !== "number")
                            return "maxHp: number expected";
                    return null;
                };

                /**
                 * Creates a HealthProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.HealthProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.HealthProto} HealthProto
                 */
                HealthProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.HealthProto)
                        return object;
                    let message = new $root.u2.shared.proto.HealthProto();
                    if (object.currentHp != null)
                        message.currentHp = Number(object.currentHp);
                    if (object.maxHp != null)
                        message.maxHp = Number(object.maxHp);
                    return message;
                };

                /**
                 * Creates a plain object from a HealthProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.HealthProto
                 * @static
                 * @param {u2.shared.proto.HealthProto} message HealthProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                HealthProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.currentHp = 0;
                        object.maxHp = 0;
                    }
                    if (message.currentHp != null && message.hasOwnProperty("currentHp"))
                        object.currentHp = options.json && !isFinite(message.currentHp) ? String(message.currentHp) : message.currentHp;
                    if (message.maxHp != null && message.hasOwnProperty("maxHp"))
                        object.maxHp = options.json && !isFinite(message.maxHp) ? String(message.maxHp) : message.maxHp;
                    return object;
                };

                /**
                 * Converts this HealthProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.HealthProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                HealthProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for HealthProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.HealthProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                HealthProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.HealthProto";
                };

                return HealthProto;
            })();

            proto.EntitySnapshotProto = (function() {

                /**
                 * Properties of an EntitySnapshotProto.
                 * @memberof u2.shared.proto
                 * @interface IEntitySnapshotProto
                 * @property {number|null} [entityId] EntitySnapshotProto entityId
                 * @property {u2.shared.proto.ITransform2DProto|null} [transform] EntitySnapshotProto transform
                 * @property {u2.shared.proto.IVelocityProto|null} [velocity] EntitySnapshotProto velocity
                 * @property {u2.shared.proto.IControlStateProto|null} [controlState] EntitySnapshotProto controlState
                 * @property {u2.shared.proto.IFlightAssistProto|null} [flightAssist] EntitySnapshotProto flightAssist
                 * @property {u2.shared.proto.IHealthProto|null} [health] EntitySnapshotProto health
                 * @property {number|null} [lastProcessedSequence] EntitySnapshotProto lastProcessedSequence
                 */

                /**
                 * Constructs a new EntitySnapshotProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents an EntitySnapshotProto.
                 * @implements IEntitySnapshotProto
                 * @constructor
                 * @param {u2.shared.proto.IEntitySnapshotProto=} [properties] Properties to set
                 */
                function EntitySnapshotProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * EntitySnapshotProto entityId.
                 * @member {number} entityId
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @instance
                 */
                EntitySnapshotProto.prototype.entityId = 0;

                /**
                 * EntitySnapshotProto transform.
                 * @member {u2.shared.proto.ITransform2DProto|null|undefined} transform
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @instance
                 */
                EntitySnapshotProto.prototype.transform = null;

                /**
                 * EntitySnapshotProto velocity.
                 * @member {u2.shared.proto.IVelocityProto|null|undefined} velocity
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @instance
                 */
                EntitySnapshotProto.prototype.velocity = null;

                /**
                 * EntitySnapshotProto controlState.
                 * @member {u2.shared.proto.IControlStateProto|null|undefined} controlState
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @instance
                 */
                EntitySnapshotProto.prototype.controlState = null;

                /**
                 * EntitySnapshotProto flightAssist.
                 * @member {u2.shared.proto.IFlightAssistProto|null|undefined} flightAssist
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @instance
                 */
                EntitySnapshotProto.prototype.flightAssist = null;

                /**
                 * EntitySnapshotProto health.
                 * @member {u2.shared.proto.IHealthProto|null|undefined} health
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @instance
                 */
                EntitySnapshotProto.prototype.health = null;

                /**
                 * EntitySnapshotProto lastProcessedSequence.
                 * @member {number} lastProcessedSequence
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @instance
                 */
                EntitySnapshotProto.prototype.lastProcessedSequence = 0;

                /**
                 * Creates a new EntitySnapshotProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @static
                 * @param {u2.shared.proto.IEntitySnapshotProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.EntitySnapshotProto} EntitySnapshotProto instance
                 */
                EntitySnapshotProto.create = function create(properties) {
                    return new EntitySnapshotProto(properties);
                };

                /**
                 * Encodes the specified EntitySnapshotProto message. Does not implicitly {@link u2.shared.proto.EntitySnapshotProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @static
                 * @param {u2.shared.proto.IEntitySnapshotProto} message EntitySnapshotProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                EntitySnapshotProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.entityId != null && Object.hasOwnProperty.call(message, "entityId"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.entityId);
                    if (message.transform != null && Object.hasOwnProperty.call(message, "transform"))
                        $root.u2.shared.proto.Transform2DProto.encode(message.transform, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.velocity != null && Object.hasOwnProperty.call(message, "velocity"))
                        $root.u2.shared.proto.VelocityProto.encode(message.velocity, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.controlState != null && Object.hasOwnProperty.call(message, "controlState"))
                        $root.u2.shared.proto.ControlStateProto.encode(message.controlState, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    if (message.flightAssist != null && Object.hasOwnProperty.call(message, "flightAssist"))
                        $root.u2.shared.proto.FlightAssistProto.encode(message.flightAssist, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                    if (message.health != null && Object.hasOwnProperty.call(message, "health"))
                        $root.u2.shared.proto.HealthProto.encode(message.health, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                    if (message.lastProcessedSequence != null && Object.hasOwnProperty.call(message, "lastProcessedSequence"))
                        writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.lastProcessedSequence);
                    return writer;
                };

                /**
                 * Encodes the specified EntitySnapshotProto message, length delimited. Does not implicitly {@link u2.shared.proto.EntitySnapshotProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @static
                 * @param {u2.shared.proto.IEntitySnapshotProto} message EntitySnapshotProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                EntitySnapshotProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an EntitySnapshotProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.EntitySnapshotProto} EntitySnapshotProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                EntitySnapshotProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.EntitySnapshotProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.entityId = reader.uint32();
                                break;
                            }
                        case 2: {
                                message.transform = $root.u2.shared.proto.Transform2DProto.decode(reader, reader.uint32());
                                break;
                            }
                        case 3: {
                                message.velocity = $root.u2.shared.proto.VelocityProto.decode(reader, reader.uint32());
                                break;
                            }
                        case 4: {
                                message.controlState = $root.u2.shared.proto.ControlStateProto.decode(reader, reader.uint32());
                                break;
                            }
                        case 5: {
                                message.flightAssist = $root.u2.shared.proto.FlightAssistProto.decode(reader, reader.uint32());
                                break;
                            }
                        case 6: {
                                message.health = $root.u2.shared.proto.HealthProto.decode(reader, reader.uint32());
                                break;
                            }
                        case 7: {
                                message.lastProcessedSequence = reader.uint32();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an EntitySnapshotProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.EntitySnapshotProto} EntitySnapshotProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                EntitySnapshotProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an EntitySnapshotProto message.
                 * @function verify
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                EntitySnapshotProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.entityId != null && message.hasOwnProperty("entityId"))
                        if (!$util.isInteger(message.entityId))
                            return "entityId: integer expected";
                    if (message.transform != null && message.hasOwnProperty("transform")) {
                        let error = $root.u2.shared.proto.Transform2DProto.verify(message.transform);
                        if (error)
                            return "transform." + error;
                    }
                    if (message.velocity != null && message.hasOwnProperty("velocity")) {
                        let error = $root.u2.shared.proto.VelocityProto.verify(message.velocity);
                        if (error)
                            return "velocity." + error;
                    }
                    if (message.controlState != null && message.hasOwnProperty("controlState")) {
                        let error = $root.u2.shared.proto.ControlStateProto.verify(message.controlState);
                        if (error)
                            return "controlState." + error;
                    }
                    if (message.flightAssist != null && message.hasOwnProperty("flightAssist")) {
                        let error = $root.u2.shared.proto.FlightAssistProto.verify(message.flightAssist);
                        if (error)
                            return "flightAssist." + error;
                    }
                    if (message.health != null && message.hasOwnProperty("health")) {
                        let error = $root.u2.shared.proto.HealthProto.verify(message.health);
                        if (error)
                            return "health." + error;
                    }
                    if (message.lastProcessedSequence != null && message.hasOwnProperty("lastProcessedSequence"))
                        if (!$util.isInteger(message.lastProcessedSequence))
                            return "lastProcessedSequence: integer expected";
                    return null;
                };

                /**
                 * Creates an EntitySnapshotProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.EntitySnapshotProto} EntitySnapshotProto
                 */
                EntitySnapshotProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.EntitySnapshotProto)
                        return object;
                    let message = new $root.u2.shared.proto.EntitySnapshotProto();
                    if (object.entityId != null)
                        message.entityId = object.entityId >>> 0;
                    if (object.transform != null) {
                        if (typeof object.transform !== "object")
                            throw TypeError(".u2.shared.proto.EntitySnapshotProto.transform: object expected");
                        message.transform = $root.u2.shared.proto.Transform2DProto.fromObject(object.transform);
                    }
                    if (object.velocity != null) {
                        if (typeof object.velocity !== "object")
                            throw TypeError(".u2.shared.proto.EntitySnapshotProto.velocity: object expected");
                        message.velocity = $root.u2.shared.proto.VelocityProto.fromObject(object.velocity);
                    }
                    if (object.controlState != null) {
                        if (typeof object.controlState !== "object")
                            throw TypeError(".u2.shared.proto.EntitySnapshotProto.controlState: object expected");
                        message.controlState = $root.u2.shared.proto.ControlStateProto.fromObject(object.controlState);
                    }
                    if (object.flightAssist != null) {
                        if (typeof object.flightAssist !== "object")
                            throw TypeError(".u2.shared.proto.EntitySnapshotProto.flightAssist: object expected");
                        message.flightAssist = $root.u2.shared.proto.FlightAssistProto.fromObject(object.flightAssist);
                    }
                    if (object.health != null) {
                        if (typeof object.health !== "object")
                            throw TypeError(".u2.shared.proto.EntitySnapshotProto.health: object expected");
                        message.health = $root.u2.shared.proto.HealthProto.fromObject(object.health);
                    }
                    if (object.lastProcessedSequence != null)
                        message.lastProcessedSequence = object.lastProcessedSequence >>> 0;
                    return message;
                };

                /**
                 * Creates a plain object from an EntitySnapshotProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @static
                 * @param {u2.shared.proto.EntitySnapshotProto} message EntitySnapshotProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                EntitySnapshotProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.entityId = 0;
                        object.transform = null;
                        object.velocity = null;
                        object.controlState = null;
                        object.flightAssist = null;
                        object.health = null;
                        object.lastProcessedSequence = 0;
                    }
                    if (message.entityId != null && message.hasOwnProperty("entityId"))
                        object.entityId = message.entityId;
                    if (message.transform != null && message.hasOwnProperty("transform"))
                        object.transform = $root.u2.shared.proto.Transform2DProto.toObject(message.transform, options);
                    if (message.velocity != null && message.hasOwnProperty("velocity"))
                        object.velocity = $root.u2.shared.proto.VelocityProto.toObject(message.velocity, options);
                    if (message.controlState != null && message.hasOwnProperty("controlState"))
                        object.controlState = $root.u2.shared.proto.ControlStateProto.toObject(message.controlState, options);
                    if (message.flightAssist != null && message.hasOwnProperty("flightAssist"))
                        object.flightAssist = $root.u2.shared.proto.FlightAssistProto.toObject(message.flightAssist, options);
                    if (message.health != null && message.hasOwnProperty("health"))
                        object.health = $root.u2.shared.proto.HealthProto.toObject(message.health, options);
                    if (message.lastProcessedSequence != null && message.hasOwnProperty("lastProcessedSequence"))
                        object.lastProcessedSequence = message.lastProcessedSequence;
                    return object;
                };

                /**
                 * Converts this EntitySnapshotProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                EntitySnapshotProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for EntitySnapshotProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.EntitySnapshotProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                EntitySnapshotProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.EntitySnapshotProto";
                };

                return EntitySnapshotProto;
            })();

            proto.WorldSnapshotProto = (function() {

                /**
                 * Properties of a WorldSnapshotProto.
                 * @memberof u2.shared.proto
                 * @interface IWorldSnapshotProto
                 * @property {number|null} [tick] WorldSnapshotProto tick
                 * @property {number|Long|null} [timestampMs] WorldSnapshotProto timestampMs
                 * @property {Array.<u2.shared.proto.IEntitySnapshotProto>|null} [entities] WorldSnapshotProto entities
                 */

                /**
                 * Constructs a new WorldSnapshotProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a WorldSnapshotProto.
                 * @implements IWorldSnapshotProto
                 * @constructor
                 * @param {u2.shared.proto.IWorldSnapshotProto=} [properties] Properties to set
                 */
                function WorldSnapshotProto(properties) {
                    this.entities = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * WorldSnapshotProto tick.
                 * @member {number} tick
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @instance
                 */
                WorldSnapshotProto.prototype.tick = 0;

                /**
                 * WorldSnapshotProto timestampMs.
                 * @member {number|Long} timestampMs
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @instance
                 */
                WorldSnapshotProto.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * WorldSnapshotProto entities.
                 * @member {Array.<u2.shared.proto.IEntitySnapshotProto>} entities
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @instance
                 */
                WorldSnapshotProto.prototype.entities = $util.emptyArray;

                /**
                 * Creates a new WorldSnapshotProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @static
                 * @param {u2.shared.proto.IWorldSnapshotProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.WorldSnapshotProto} WorldSnapshotProto instance
                 */
                WorldSnapshotProto.create = function create(properties) {
                    return new WorldSnapshotProto(properties);
                };

                /**
                 * Encodes the specified WorldSnapshotProto message. Does not implicitly {@link u2.shared.proto.WorldSnapshotProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @static
                 * @param {u2.shared.proto.IWorldSnapshotProto} message WorldSnapshotProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                WorldSnapshotProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.tick != null && Object.hasOwnProperty.call(message, "tick"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.tick);
                    if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.timestampMs);
                    if (message.entities != null && message.entities.length)
                        for (let i = 0; i < message.entities.length; ++i)
                            $root.u2.shared.proto.EntitySnapshotProto.encode(message.entities[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified WorldSnapshotProto message, length delimited. Does not implicitly {@link u2.shared.proto.WorldSnapshotProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @static
                 * @param {u2.shared.proto.IWorldSnapshotProto} message WorldSnapshotProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                WorldSnapshotProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a WorldSnapshotProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.WorldSnapshotProto} WorldSnapshotProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                WorldSnapshotProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.WorldSnapshotProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.tick = reader.uint32();
                                break;
                            }
                        case 2: {
                                message.timestampMs = reader.uint64();
                                break;
                            }
                        case 3: {
                                if (!(message.entities && message.entities.length))
                                    message.entities = [];
                                message.entities.push($root.u2.shared.proto.EntitySnapshotProto.decode(reader, reader.uint32()));
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a WorldSnapshotProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.WorldSnapshotProto} WorldSnapshotProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                WorldSnapshotProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a WorldSnapshotProto message.
                 * @function verify
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                WorldSnapshotProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.tick != null && message.hasOwnProperty("tick"))
                        if (!$util.isInteger(message.tick))
                            return "tick: integer expected";
                    if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                        if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                            return "timestampMs: integer|Long expected";
                    if (message.entities != null && message.hasOwnProperty("entities")) {
                        if (!Array.isArray(message.entities))
                            return "entities: array expected";
                        for (let i = 0; i < message.entities.length; ++i) {
                            let error = $root.u2.shared.proto.EntitySnapshotProto.verify(message.entities[i]);
                            if (error)
                                return "entities." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a WorldSnapshotProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.WorldSnapshotProto} WorldSnapshotProto
                 */
                WorldSnapshotProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.WorldSnapshotProto)
                        return object;
                    let message = new $root.u2.shared.proto.WorldSnapshotProto();
                    if (object.tick != null)
                        message.tick = object.tick >>> 0;
                    if (object.timestampMs != null)
                        if ($util.Long)
                            (message.timestampMs = $util.Long.fromValue(object.timestampMs)).unsigned = true;
                        else if (typeof object.timestampMs === "string")
                            message.timestampMs = parseInt(object.timestampMs, 10);
                        else if (typeof object.timestampMs === "number")
                            message.timestampMs = object.timestampMs;
                        else if (typeof object.timestampMs === "object")
                            message.timestampMs = new $util.LongBits(object.timestampMs.low >>> 0, object.timestampMs.high >>> 0).toNumber(true);
                    if (object.entities) {
                        if (!Array.isArray(object.entities))
                            throw TypeError(".u2.shared.proto.WorldSnapshotProto.entities: array expected");
                        message.entities = [];
                        for (let i = 0; i < object.entities.length; ++i) {
                            if (typeof object.entities[i] !== "object")
                                throw TypeError(".u2.shared.proto.WorldSnapshotProto.entities: object expected");
                            message.entities[i] = $root.u2.shared.proto.EntitySnapshotProto.fromObject(object.entities[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a WorldSnapshotProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @static
                 * @param {u2.shared.proto.WorldSnapshotProto} message WorldSnapshotProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                WorldSnapshotProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.entities = [];
                    if (options.defaults) {
                        object.tick = 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.timestampMs = options.longs === String ? "0" : 0;
                    }
                    if (message.tick != null && message.hasOwnProperty("tick"))
                        object.tick = message.tick;
                    if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                        if (typeof message.timestampMs === "number")
                            object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                        else
                            object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber(true) : message.timestampMs;
                    if (message.entities && message.entities.length) {
                        object.entities = [];
                        for (let j = 0; j < message.entities.length; ++j)
                            object.entities[j] = $root.u2.shared.proto.EntitySnapshotProto.toObject(message.entities[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this WorldSnapshotProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                WorldSnapshotProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for WorldSnapshotProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.WorldSnapshotProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                WorldSnapshotProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.WorldSnapshotProto";
                };

                return WorldSnapshotProto;
            })();

            proto.PlayerInputProto = (function() {

                /**
                 * Properties of a PlayerInputProto.
                 * @memberof u2.shared.proto
                 * @interface IPlayerInputProto
                 * @property {number|null} [clientId] PlayerInputProto clientId
                 * @property {number|null} [sequenceNumber] PlayerInputProto sequenceNumber
                 * @property {number|Long|null} [timestampMs] PlayerInputProto timestampMs
                 * @property {u2.shared.proto.IControlStateProto|null} [controlState] PlayerInputProto controlState
                 * @property {boolean|null} [flightAssist] PlayerInputProto flightAssist
                 */

                /**
                 * Constructs a new PlayerInputProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a PlayerInputProto.
                 * @implements IPlayerInputProto
                 * @constructor
                 * @param {u2.shared.proto.IPlayerInputProto=} [properties] Properties to set
                 */
                function PlayerInputProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * PlayerInputProto clientId.
                 * @member {number} clientId
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @instance
                 */
                PlayerInputProto.prototype.clientId = 0;

                /**
                 * PlayerInputProto sequenceNumber.
                 * @member {number} sequenceNumber
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @instance
                 */
                PlayerInputProto.prototype.sequenceNumber = 0;

                /**
                 * PlayerInputProto timestampMs.
                 * @member {number|Long} timestampMs
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @instance
                 */
                PlayerInputProto.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * PlayerInputProto controlState.
                 * @member {u2.shared.proto.IControlStateProto|null|undefined} controlState
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @instance
                 */
                PlayerInputProto.prototype.controlState = null;

                /**
                 * PlayerInputProto flightAssist.
                 * @member {boolean} flightAssist
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @instance
                 */
                PlayerInputProto.prototype.flightAssist = false;

                /**
                 * Creates a new PlayerInputProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @static
                 * @param {u2.shared.proto.IPlayerInputProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.PlayerInputProto} PlayerInputProto instance
                 */
                PlayerInputProto.create = function create(properties) {
                    return new PlayerInputProto(properties);
                };

                /**
                 * Encodes the specified PlayerInputProto message. Does not implicitly {@link u2.shared.proto.PlayerInputProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @static
                 * @param {u2.shared.proto.IPlayerInputProto} message PlayerInputProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                PlayerInputProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.clientId != null && Object.hasOwnProperty.call(message, "clientId"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.clientId);
                    if (message.sequenceNumber != null && Object.hasOwnProperty.call(message, "sequenceNumber"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.sequenceNumber);
                    if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.timestampMs);
                    if (message.controlState != null && Object.hasOwnProperty.call(message, "controlState"))
                        $root.u2.shared.proto.ControlStateProto.encode(message.controlState, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    if (message.flightAssist != null && Object.hasOwnProperty.call(message, "flightAssist"))
                        writer.uint32(/* id 5, wireType 0 =*/40).bool(message.flightAssist);
                    return writer;
                };

                /**
                 * Encodes the specified PlayerInputProto message, length delimited. Does not implicitly {@link u2.shared.proto.PlayerInputProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @static
                 * @param {u2.shared.proto.IPlayerInputProto} message PlayerInputProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                PlayerInputProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a PlayerInputProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.PlayerInputProto} PlayerInputProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                PlayerInputProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.PlayerInputProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.clientId = reader.uint32();
                                break;
                            }
                        case 2: {
                                message.sequenceNumber = reader.uint32();
                                break;
                            }
                        case 3: {
                                message.timestampMs = reader.uint64();
                                break;
                            }
                        case 4: {
                                message.controlState = $root.u2.shared.proto.ControlStateProto.decode(reader, reader.uint32());
                                break;
                            }
                        case 5: {
                                message.flightAssist = reader.bool();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a PlayerInputProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.PlayerInputProto} PlayerInputProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                PlayerInputProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a PlayerInputProto message.
                 * @function verify
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                PlayerInputProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.clientId != null && message.hasOwnProperty("clientId"))
                        if (!$util.isInteger(message.clientId))
                            return "clientId: integer expected";
                    if (message.sequenceNumber != null && message.hasOwnProperty("sequenceNumber"))
                        if (!$util.isInteger(message.sequenceNumber))
                            return "sequenceNumber: integer expected";
                    if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                        if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                            return "timestampMs: integer|Long expected";
                    if (message.controlState != null && message.hasOwnProperty("controlState")) {
                        let error = $root.u2.shared.proto.ControlStateProto.verify(message.controlState);
                        if (error)
                            return "controlState." + error;
                    }
                    if (message.flightAssist != null && message.hasOwnProperty("flightAssist"))
                        if (typeof message.flightAssist !== "boolean")
                            return "flightAssist: boolean expected";
                    return null;
                };

                /**
                 * Creates a PlayerInputProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.PlayerInputProto} PlayerInputProto
                 */
                PlayerInputProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.PlayerInputProto)
                        return object;
                    let message = new $root.u2.shared.proto.PlayerInputProto();
                    if (object.clientId != null)
                        message.clientId = object.clientId >>> 0;
                    if (object.sequenceNumber != null)
                        message.sequenceNumber = object.sequenceNumber >>> 0;
                    if (object.timestampMs != null)
                        if ($util.Long)
                            (message.timestampMs = $util.Long.fromValue(object.timestampMs)).unsigned = true;
                        else if (typeof object.timestampMs === "string")
                            message.timestampMs = parseInt(object.timestampMs, 10);
                        else if (typeof object.timestampMs === "number")
                            message.timestampMs = object.timestampMs;
                        else if (typeof object.timestampMs === "object")
                            message.timestampMs = new $util.LongBits(object.timestampMs.low >>> 0, object.timestampMs.high >>> 0).toNumber(true);
                    if (object.controlState != null) {
                        if (typeof object.controlState !== "object")
                            throw TypeError(".u2.shared.proto.PlayerInputProto.controlState: object expected");
                        message.controlState = $root.u2.shared.proto.ControlStateProto.fromObject(object.controlState);
                    }
                    if (object.flightAssist != null)
                        message.flightAssist = Boolean(object.flightAssist);
                    return message;
                };

                /**
                 * Creates a plain object from a PlayerInputProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @static
                 * @param {u2.shared.proto.PlayerInputProto} message PlayerInputProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                PlayerInputProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.clientId = 0;
                        object.sequenceNumber = 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.timestampMs = options.longs === String ? "0" : 0;
                        object.controlState = null;
                        object.flightAssist = false;
                    }
                    if (message.clientId != null && message.hasOwnProperty("clientId"))
                        object.clientId = message.clientId;
                    if (message.sequenceNumber != null && message.hasOwnProperty("sequenceNumber"))
                        object.sequenceNumber = message.sequenceNumber;
                    if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                        if (typeof message.timestampMs === "number")
                            object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                        else
                            object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber(true) : message.timestampMs;
                    if (message.controlState != null && message.hasOwnProperty("controlState"))
                        object.controlState = $root.u2.shared.proto.ControlStateProto.toObject(message.controlState, options);
                    if (message.flightAssist != null && message.hasOwnProperty("flightAssist"))
                        object.flightAssist = message.flightAssist;
                    return object;
                };

                /**
                 * Converts this PlayerInputProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                PlayerInputProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for PlayerInputProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.PlayerInputProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                PlayerInputProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.PlayerInputProto";
                };

                return PlayerInputProto;
            })();

            proto.ConnectionAcceptedProto = (function() {

                /**
                 * Properties of a ConnectionAcceptedProto.
                 * @memberof u2.shared.proto
                 * @interface IConnectionAcceptedProto
                 * @property {number|null} [clientId] ConnectionAcceptedProto clientId
                 * @property {number|null} [entityId] ConnectionAcceptedProto entityId
                 * @property {number|Long|null} [serverTimeMs] ConnectionAcceptedProto serverTimeMs
                 */

                /**
                 * Constructs a new ConnectionAcceptedProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a ConnectionAcceptedProto.
                 * @implements IConnectionAcceptedProto
                 * @constructor
                 * @param {u2.shared.proto.IConnectionAcceptedProto=} [properties] Properties to set
                 */
                function ConnectionAcceptedProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ConnectionAcceptedProto clientId.
                 * @member {number} clientId
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @instance
                 */
                ConnectionAcceptedProto.prototype.clientId = 0;

                /**
                 * ConnectionAcceptedProto entityId.
                 * @member {number} entityId
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @instance
                 */
                ConnectionAcceptedProto.prototype.entityId = 0;

                /**
                 * ConnectionAcceptedProto serverTimeMs.
                 * @member {number|Long} serverTimeMs
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @instance
                 */
                ConnectionAcceptedProto.prototype.serverTimeMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * Creates a new ConnectionAcceptedProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @static
                 * @param {u2.shared.proto.IConnectionAcceptedProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.ConnectionAcceptedProto} ConnectionAcceptedProto instance
                 */
                ConnectionAcceptedProto.create = function create(properties) {
                    return new ConnectionAcceptedProto(properties);
                };

                /**
                 * Encodes the specified ConnectionAcceptedProto message. Does not implicitly {@link u2.shared.proto.ConnectionAcceptedProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @static
                 * @param {u2.shared.proto.IConnectionAcceptedProto} message ConnectionAcceptedProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ConnectionAcceptedProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.clientId != null && Object.hasOwnProperty.call(message, "clientId"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.clientId);
                    if (message.entityId != null && Object.hasOwnProperty.call(message, "entityId"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.entityId);
                    if (message.serverTimeMs != null && Object.hasOwnProperty.call(message, "serverTimeMs"))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.serverTimeMs);
                    return writer;
                };

                /**
                 * Encodes the specified ConnectionAcceptedProto message, length delimited. Does not implicitly {@link u2.shared.proto.ConnectionAcceptedProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @static
                 * @param {u2.shared.proto.IConnectionAcceptedProto} message ConnectionAcceptedProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ConnectionAcceptedProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ConnectionAcceptedProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.ConnectionAcceptedProto} ConnectionAcceptedProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ConnectionAcceptedProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.ConnectionAcceptedProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.clientId = reader.uint32();
                                break;
                            }
                        case 2: {
                                message.entityId = reader.uint32();
                                break;
                            }
                        case 3: {
                                message.serverTimeMs = reader.uint64();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ConnectionAcceptedProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.ConnectionAcceptedProto} ConnectionAcceptedProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ConnectionAcceptedProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ConnectionAcceptedProto message.
                 * @function verify
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ConnectionAcceptedProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.clientId != null && message.hasOwnProperty("clientId"))
                        if (!$util.isInteger(message.clientId))
                            return "clientId: integer expected";
                    if (message.entityId != null && message.hasOwnProperty("entityId"))
                        if (!$util.isInteger(message.entityId))
                            return "entityId: integer expected";
                    if (message.serverTimeMs != null && message.hasOwnProperty("serverTimeMs"))
                        if (!$util.isInteger(message.serverTimeMs) && !(message.serverTimeMs && $util.isInteger(message.serverTimeMs.low) && $util.isInteger(message.serverTimeMs.high)))
                            return "serverTimeMs: integer|Long expected";
                    return null;
                };

                /**
                 * Creates a ConnectionAcceptedProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.ConnectionAcceptedProto} ConnectionAcceptedProto
                 */
                ConnectionAcceptedProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.ConnectionAcceptedProto)
                        return object;
                    let message = new $root.u2.shared.proto.ConnectionAcceptedProto();
                    if (object.clientId != null)
                        message.clientId = object.clientId >>> 0;
                    if (object.entityId != null)
                        message.entityId = object.entityId >>> 0;
                    if (object.serverTimeMs != null)
                        if ($util.Long)
                            (message.serverTimeMs = $util.Long.fromValue(object.serverTimeMs)).unsigned = true;
                        else if (typeof object.serverTimeMs === "string")
                            message.serverTimeMs = parseInt(object.serverTimeMs, 10);
                        else if (typeof object.serverTimeMs === "number")
                            message.serverTimeMs = object.serverTimeMs;
                        else if (typeof object.serverTimeMs === "object")
                            message.serverTimeMs = new $util.LongBits(object.serverTimeMs.low >>> 0, object.serverTimeMs.high >>> 0).toNumber(true);
                    return message;
                };

                /**
                 * Creates a plain object from a ConnectionAcceptedProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @static
                 * @param {u2.shared.proto.ConnectionAcceptedProto} message ConnectionAcceptedProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ConnectionAcceptedProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.clientId = 0;
                        object.entityId = 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.serverTimeMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.serverTimeMs = options.longs === String ? "0" : 0;
                    }
                    if (message.clientId != null && message.hasOwnProperty("clientId"))
                        object.clientId = message.clientId;
                    if (message.entityId != null && message.hasOwnProperty("entityId"))
                        object.entityId = message.entityId;
                    if (message.serverTimeMs != null && message.hasOwnProperty("serverTimeMs"))
                        if (typeof message.serverTimeMs === "number")
                            object.serverTimeMs = options.longs === String ? String(message.serverTimeMs) : message.serverTimeMs;
                        else
                            object.serverTimeMs = options.longs === String ? $util.Long.prototype.toString.call(message.serverTimeMs) : options.longs === Number ? new $util.LongBits(message.serverTimeMs.low >>> 0, message.serverTimeMs.high >>> 0).toNumber(true) : message.serverTimeMs;
                    return object;
                };

                /**
                 * Converts this ConnectionAcceptedProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ConnectionAcceptedProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ConnectionAcceptedProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.ConnectionAcceptedProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ConnectionAcceptedProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.ConnectionAcceptedProto";
                };

                return ConnectionAcceptedProto;
            })();

            proto.ConnectionRequestProto = (function() {

                /**
                 * Properties of a ConnectionRequestProto.
                 * @memberof u2.shared.proto
                 * @interface IConnectionRequestProto
                 * @property {string|null} [playerName] ConnectionRequestProto playerName
                 * @property {string|null} [version] ConnectionRequestProto version
                 */

                /**
                 * Constructs a new ConnectionRequestProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a ConnectionRequestProto.
                 * @implements IConnectionRequestProto
                 * @constructor
                 * @param {u2.shared.proto.IConnectionRequestProto=} [properties] Properties to set
                 */
                function ConnectionRequestProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ConnectionRequestProto playerName.
                 * @member {string} playerName
                 * @memberof u2.shared.proto.ConnectionRequestProto
                 * @instance
                 */
                ConnectionRequestProto.prototype.playerName = "";

                /**
                 * ConnectionRequestProto version.
                 * @member {string} version
                 * @memberof u2.shared.proto.ConnectionRequestProto
                 * @instance
                 */
                ConnectionRequestProto.prototype.version = "";

                /**
                 * Creates a new ConnectionRequestProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.ConnectionRequestProto
                 * @static
                 * @param {u2.shared.proto.IConnectionRequestProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.ConnectionRequestProto} ConnectionRequestProto instance
                 */
                ConnectionRequestProto.create = function create(properties) {
                    return new ConnectionRequestProto(properties);
                };

                /**
                 * Encodes the specified ConnectionRequestProto message. Does not implicitly {@link u2.shared.proto.ConnectionRequestProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.ConnectionRequestProto
                 * @static
                 * @param {u2.shared.proto.IConnectionRequestProto} message ConnectionRequestProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ConnectionRequestProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.playerName != null && Object.hasOwnProperty.call(message, "playerName"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.playerName);
                    if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.version);
                    return writer;
                };

                /**
                 * Encodes the specified ConnectionRequestProto message, length delimited. Does not implicitly {@link u2.shared.proto.ConnectionRequestProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.ConnectionRequestProto
                 * @static
                 * @param {u2.shared.proto.IConnectionRequestProto} message ConnectionRequestProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ConnectionRequestProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ConnectionRequestProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.ConnectionRequestProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.ConnectionRequestProto} ConnectionRequestProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ConnectionRequestProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.ConnectionRequestProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.playerName = reader.string();
                                break;
                            }
                        case 2: {
                                message.version = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ConnectionRequestProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.ConnectionRequestProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.ConnectionRequestProto} ConnectionRequestProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ConnectionRequestProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ConnectionRequestProto message.
                 * @function verify
                 * @memberof u2.shared.proto.ConnectionRequestProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ConnectionRequestProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.playerName != null && message.hasOwnProperty("playerName"))
                        if (!$util.isString(message.playerName))
                            return "playerName: string expected";
                    if (message.version != null && message.hasOwnProperty("version"))
                        if (!$util.isString(message.version))
                            return "version: string expected";
                    return null;
                };

                /**
                 * Creates a ConnectionRequestProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.ConnectionRequestProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.ConnectionRequestProto} ConnectionRequestProto
                 */
                ConnectionRequestProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.ConnectionRequestProto)
                        return object;
                    let message = new $root.u2.shared.proto.ConnectionRequestProto();
                    if (object.playerName != null)
                        message.playerName = String(object.playerName);
                    if (object.version != null)
                        message.version = String(object.version);
                    return message;
                };

                /**
                 * Creates a plain object from a ConnectionRequestProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.ConnectionRequestProto
                 * @static
                 * @param {u2.shared.proto.ConnectionRequestProto} message ConnectionRequestProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ConnectionRequestProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.playerName = "";
                        object.version = "";
                    }
                    if (message.playerName != null && message.hasOwnProperty("playerName"))
                        object.playerName = message.playerName;
                    if (message.version != null && message.hasOwnProperty("version"))
                        object.version = message.version;
                    return object;
                };

                /**
                 * Converts this ConnectionRequestProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.ConnectionRequestProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ConnectionRequestProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ConnectionRequestProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.ConnectionRequestProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ConnectionRequestProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.ConnectionRequestProto";
                };

                return ConnectionRequestProto;
            })();

            proto.DisconnectProto = (function() {

                /**
                 * Properties of a DisconnectProto.
                 * @memberof u2.shared.proto
                 * @interface IDisconnectProto
                 * @property {number|null} [clientId] DisconnectProto clientId
                 * @property {string|null} [reason] DisconnectProto reason
                 */

                /**
                 * Constructs a new DisconnectProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a DisconnectProto.
                 * @implements IDisconnectProto
                 * @constructor
                 * @param {u2.shared.proto.IDisconnectProto=} [properties] Properties to set
                 */
                function DisconnectProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * DisconnectProto clientId.
                 * @member {number} clientId
                 * @memberof u2.shared.proto.DisconnectProto
                 * @instance
                 */
                DisconnectProto.prototype.clientId = 0;

                /**
                 * DisconnectProto reason.
                 * @member {string} reason
                 * @memberof u2.shared.proto.DisconnectProto
                 * @instance
                 */
                DisconnectProto.prototype.reason = "";

                /**
                 * Creates a new DisconnectProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.DisconnectProto
                 * @static
                 * @param {u2.shared.proto.IDisconnectProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.DisconnectProto} DisconnectProto instance
                 */
                DisconnectProto.create = function create(properties) {
                    return new DisconnectProto(properties);
                };

                /**
                 * Encodes the specified DisconnectProto message. Does not implicitly {@link u2.shared.proto.DisconnectProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.DisconnectProto
                 * @static
                 * @param {u2.shared.proto.IDisconnectProto} message DisconnectProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DisconnectProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.clientId != null && Object.hasOwnProperty.call(message, "clientId"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.clientId);
                    if (message.reason != null && Object.hasOwnProperty.call(message, "reason"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.reason);
                    return writer;
                };

                /**
                 * Encodes the specified DisconnectProto message, length delimited. Does not implicitly {@link u2.shared.proto.DisconnectProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.DisconnectProto
                 * @static
                 * @param {u2.shared.proto.IDisconnectProto} message DisconnectProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DisconnectProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a DisconnectProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.DisconnectProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.DisconnectProto} DisconnectProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DisconnectProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.DisconnectProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.clientId = reader.uint32();
                                break;
                            }
                        case 2: {
                                message.reason = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a DisconnectProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.DisconnectProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.DisconnectProto} DisconnectProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DisconnectProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a DisconnectProto message.
                 * @function verify
                 * @memberof u2.shared.proto.DisconnectProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DisconnectProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.clientId != null && message.hasOwnProperty("clientId"))
                        if (!$util.isInteger(message.clientId))
                            return "clientId: integer expected";
                    if (message.reason != null && message.hasOwnProperty("reason"))
                        if (!$util.isString(message.reason))
                            return "reason: string expected";
                    return null;
                };

                /**
                 * Creates a DisconnectProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.DisconnectProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.DisconnectProto} DisconnectProto
                 */
                DisconnectProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.DisconnectProto)
                        return object;
                    let message = new $root.u2.shared.proto.DisconnectProto();
                    if (object.clientId != null)
                        message.clientId = object.clientId >>> 0;
                    if (object.reason != null)
                        message.reason = String(object.reason);
                    return message;
                };

                /**
                 * Creates a plain object from a DisconnectProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.DisconnectProto
                 * @static
                 * @param {u2.shared.proto.DisconnectProto} message DisconnectProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DisconnectProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.clientId = 0;
                        object.reason = "";
                    }
                    if (message.clientId != null && message.hasOwnProperty("clientId"))
                        object.clientId = message.clientId;
                    if (message.reason != null && message.hasOwnProperty("reason"))
                        object.reason = message.reason;
                    return object;
                };

                /**
                 * Converts this DisconnectProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.DisconnectProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DisconnectProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for DisconnectProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.DisconnectProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                DisconnectProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.DisconnectProto";
                };

                return DisconnectProto;
            })();

            proto.ClientMessageProto = (function() {

                /**
                 * Properties of a ClientMessageProto.
                 * @memberof u2.shared.proto
                 * @interface IClientMessageProto
                 * @property {u2.shared.proto.IConnectionRequestProto|null} [connectionRequest] ClientMessageProto connectionRequest
                 * @property {u2.shared.proto.IPlayerInputProto|null} [playerInput] ClientMessageProto playerInput
                 */

                /**
                 * Constructs a new ClientMessageProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a ClientMessageProto.
                 * @implements IClientMessageProto
                 * @constructor
                 * @param {u2.shared.proto.IClientMessageProto=} [properties] Properties to set
                 */
                function ClientMessageProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ClientMessageProto connectionRequest.
                 * @member {u2.shared.proto.IConnectionRequestProto|null|undefined} connectionRequest
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @instance
                 */
                ClientMessageProto.prototype.connectionRequest = null;

                /**
                 * ClientMessageProto playerInput.
                 * @member {u2.shared.proto.IPlayerInputProto|null|undefined} playerInput
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @instance
                 */
                ClientMessageProto.prototype.playerInput = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * ClientMessageProto message.
                 * @member {"connectionRequest"|"playerInput"|undefined} message
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @instance
                 */
                Object.defineProperty(ClientMessageProto.prototype, "message", {
                    get: $util.oneOfGetter($oneOfFields = ["connectionRequest", "playerInput"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new ClientMessageProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @static
                 * @param {u2.shared.proto.IClientMessageProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.ClientMessageProto} ClientMessageProto instance
                 */
                ClientMessageProto.create = function create(properties) {
                    return new ClientMessageProto(properties);
                };

                /**
                 * Encodes the specified ClientMessageProto message. Does not implicitly {@link u2.shared.proto.ClientMessageProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @static
                 * @param {u2.shared.proto.IClientMessageProto} message ClientMessageProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ClientMessageProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.connectionRequest != null && Object.hasOwnProperty.call(message, "connectionRequest"))
                        $root.u2.shared.proto.ConnectionRequestProto.encode(message.connectionRequest, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.playerInput != null && Object.hasOwnProperty.call(message, "playerInput"))
                        $root.u2.shared.proto.PlayerInputProto.encode(message.playerInput, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ClientMessageProto message, length delimited. Does not implicitly {@link u2.shared.proto.ClientMessageProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @static
                 * @param {u2.shared.proto.IClientMessageProto} message ClientMessageProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ClientMessageProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ClientMessageProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.ClientMessageProto} ClientMessageProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ClientMessageProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.ClientMessageProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.connectionRequest = $root.u2.shared.proto.ConnectionRequestProto.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.playerInput = $root.u2.shared.proto.PlayerInputProto.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ClientMessageProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.ClientMessageProto} ClientMessageProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ClientMessageProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ClientMessageProto message.
                 * @function verify
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ClientMessageProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.connectionRequest != null && message.hasOwnProperty("connectionRequest")) {
                        properties.message = 1;
                        {
                            let error = $root.u2.shared.proto.ConnectionRequestProto.verify(message.connectionRequest);
                            if (error)
                                return "connectionRequest." + error;
                        }
                    }
                    if (message.playerInput != null && message.hasOwnProperty("playerInput")) {
                        if (properties.message === 1)
                            return "message: multiple values";
                        properties.message = 1;
                        {
                            let error = $root.u2.shared.proto.PlayerInputProto.verify(message.playerInput);
                            if (error)
                                return "playerInput." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a ClientMessageProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.ClientMessageProto} ClientMessageProto
                 */
                ClientMessageProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.ClientMessageProto)
                        return object;
                    let message = new $root.u2.shared.proto.ClientMessageProto();
                    if (object.connectionRequest != null) {
                        if (typeof object.connectionRequest !== "object")
                            throw TypeError(".u2.shared.proto.ClientMessageProto.connectionRequest: object expected");
                        message.connectionRequest = $root.u2.shared.proto.ConnectionRequestProto.fromObject(object.connectionRequest);
                    }
                    if (object.playerInput != null) {
                        if (typeof object.playerInput !== "object")
                            throw TypeError(".u2.shared.proto.ClientMessageProto.playerInput: object expected");
                        message.playerInput = $root.u2.shared.proto.PlayerInputProto.fromObject(object.playerInput);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ClientMessageProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @static
                 * @param {u2.shared.proto.ClientMessageProto} message ClientMessageProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ClientMessageProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (message.connectionRequest != null && message.hasOwnProperty("connectionRequest")) {
                        object.connectionRequest = $root.u2.shared.proto.ConnectionRequestProto.toObject(message.connectionRequest, options);
                        if (options.oneofs)
                            object.message = "connectionRequest";
                    }
                    if (message.playerInput != null && message.hasOwnProperty("playerInput")) {
                        object.playerInput = $root.u2.shared.proto.PlayerInputProto.toObject(message.playerInput, options);
                        if (options.oneofs)
                            object.message = "playerInput";
                    }
                    return object;
                };

                /**
                 * Converts this ClientMessageProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ClientMessageProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ClientMessageProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.ClientMessageProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ClientMessageProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.ClientMessageProto";
                };

                return ClientMessageProto;
            })();

            proto.ServerMessageProto = (function() {

                /**
                 * Properties of a ServerMessageProto.
                 * @memberof u2.shared.proto
                 * @interface IServerMessageProto
                 * @property {u2.shared.proto.IConnectionAcceptedProto|null} [connectionAccepted] ServerMessageProto connectionAccepted
                 * @property {u2.shared.proto.IWorldSnapshotProto|null} [worldSnapshot] ServerMessageProto worldSnapshot
                 * @property {u2.shared.proto.IDisconnectProto|null} [disconnect] ServerMessageProto disconnect
                 */

                /**
                 * Constructs a new ServerMessageProto.
                 * @memberof u2.shared.proto
                 * @classdesc Represents a ServerMessageProto.
                 * @implements IServerMessageProto
                 * @constructor
                 * @param {u2.shared.proto.IServerMessageProto=} [properties] Properties to set
                 */
                function ServerMessageProto(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ServerMessageProto connectionAccepted.
                 * @member {u2.shared.proto.IConnectionAcceptedProto|null|undefined} connectionAccepted
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @instance
                 */
                ServerMessageProto.prototype.connectionAccepted = null;

                /**
                 * ServerMessageProto worldSnapshot.
                 * @member {u2.shared.proto.IWorldSnapshotProto|null|undefined} worldSnapshot
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @instance
                 */
                ServerMessageProto.prototype.worldSnapshot = null;

                /**
                 * ServerMessageProto disconnect.
                 * @member {u2.shared.proto.IDisconnectProto|null|undefined} disconnect
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @instance
                 */
                ServerMessageProto.prototype.disconnect = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * ServerMessageProto message.
                 * @member {"connectionAccepted"|"worldSnapshot"|"disconnect"|undefined} message
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @instance
                 */
                Object.defineProperty(ServerMessageProto.prototype, "message", {
                    get: $util.oneOfGetter($oneOfFields = ["connectionAccepted", "worldSnapshot", "disconnect"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new ServerMessageProto instance using the specified properties.
                 * @function create
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @static
                 * @param {u2.shared.proto.IServerMessageProto=} [properties] Properties to set
                 * @returns {u2.shared.proto.ServerMessageProto} ServerMessageProto instance
                 */
                ServerMessageProto.create = function create(properties) {
                    return new ServerMessageProto(properties);
                };

                /**
                 * Encodes the specified ServerMessageProto message. Does not implicitly {@link u2.shared.proto.ServerMessageProto.verify|verify} messages.
                 * @function encode
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @static
                 * @param {u2.shared.proto.IServerMessageProto} message ServerMessageProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ServerMessageProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.connectionAccepted != null && Object.hasOwnProperty.call(message, "connectionAccepted"))
                        $root.u2.shared.proto.ConnectionAcceptedProto.encode(message.connectionAccepted, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.worldSnapshot != null && Object.hasOwnProperty.call(message, "worldSnapshot"))
                        $root.u2.shared.proto.WorldSnapshotProto.encode(message.worldSnapshot, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.disconnect != null && Object.hasOwnProperty.call(message, "disconnect"))
                        $root.u2.shared.proto.DisconnectProto.encode(message.disconnect, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ServerMessageProto message, length delimited. Does not implicitly {@link u2.shared.proto.ServerMessageProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @static
                 * @param {u2.shared.proto.IServerMessageProto} message ServerMessageProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ServerMessageProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ServerMessageProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {u2.shared.proto.ServerMessageProto} ServerMessageProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ServerMessageProto.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.u2.shared.proto.ServerMessageProto();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.connectionAccepted = $root.u2.shared.proto.ConnectionAcceptedProto.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.worldSnapshot = $root.u2.shared.proto.WorldSnapshotProto.decode(reader, reader.uint32());
                                break;
                            }
                        case 3: {
                                message.disconnect = $root.u2.shared.proto.DisconnectProto.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ServerMessageProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {u2.shared.proto.ServerMessageProto} ServerMessageProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ServerMessageProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ServerMessageProto message.
                 * @function verify
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ServerMessageProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.connectionAccepted != null && message.hasOwnProperty("connectionAccepted")) {
                        properties.message = 1;
                        {
                            let error = $root.u2.shared.proto.ConnectionAcceptedProto.verify(message.connectionAccepted);
                            if (error)
                                return "connectionAccepted." + error;
                        }
                    }
                    if (message.worldSnapshot != null && message.hasOwnProperty("worldSnapshot")) {
                        if (properties.message === 1)
                            return "message: multiple values";
                        properties.message = 1;
                        {
                            let error = $root.u2.shared.proto.WorldSnapshotProto.verify(message.worldSnapshot);
                            if (error)
                                return "worldSnapshot." + error;
                        }
                    }
                    if (message.disconnect != null && message.hasOwnProperty("disconnect")) {
                        if (properties.message === 1)
                            return "message: multiple values";
                        properties.message = 1;
                        {
                            let error = $root.u2.shared.proto.DisconnectProto.verify(message.disconnect);
                            if (error)
                                return "disconnect." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a ServerMessageProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {u2.shared.proto.ServerMessageProto} ServerMessageProto
                 */
                ServerMessageProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.u2.shared.proto.ServerMessageProto)
                        return object;
                    let message = new $root.u2.shared.proto.ServerMessageProto();
                    if (object.connectionAccepted != null) {
                        if (typeof object.connectionAccepted !== "object")
                            throw TypeError(".u2.shared.proto.ServerMessageProto.connectionAccepted: object expected");
                        message.connectionAccepted = $root.u2.shared.proto.ConnectionAcceptedProto.fromObject(object.connectionAccepted);
                    }
                    if (object.worldSnapshot != null) {
                        if (typeof object.worldSnapshot !== "object")
                            throw TypeError(".u2.shared.proto.ServerMessageProto.worldSnapshot: object expected");
                        message.worldSnapshot = $root.u2.shared.proto.WorldSnapshotProto.fromObject(object.worldSnapshot);
                    }
                    if (object.disconnect != null) {
                        if (typeof object.disconnect !== "object")
                            throw TypeError(".u2.shared.proto.ServerMessageProto.disconnect: object expected");
                        message.disconnect = $root.u2.shared.proto.DisconnectProto.fromObject(object.disconnect);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ServerMessageProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @static
                 * @param {u2.shared.proto.ServerMessageProto} message ServerMessageProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ServerMessageProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (message.connectionAccepted != null && message.hasOwnProperty("connectionAccepted")) {
                        object.connectionAccepted = $root.u2.shared.proto.ConnectionAcceptedProto.toObject(message.connectionAccepted, options);
                        if (options.oneofs)
                            object.message = "connectionAccepted";
                    }
                    if (message.worldSnapshot != null && message.hasOwnProperty("worldSnapshot")) {
                        object.worldSnapshot = $root.u2.shared.proto.WorldSnapshotProto.toObject(message.worldSnapshot, options);
                        if (options.oneofs)
                            object.message = "worldSnapshot";
                    }
                    if (message.disconnect != null && message.hasOwnProperty("disconnect")) {
                        object.disconnect = $root.u2.shared.proto.DisconnectProto.toObject(message.disconnect, options);
                        if (options.oneofs)
                            object.message = "disconnect";
                    }
                    return object;
                };

                /**
                 * Converts this ServerMessageProto to JSON.
                 * @function toJSON
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ServerMessageProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ServerMessageProto
                 * @function getTypeUrl
                 * @memberof u2.shared.proto.ServerMessageProto
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ServerMessageProto.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/u2.shared.proto.ServerMessageProto";
                };

                return ServerMessageProto;
            })();

            return proto;
        })();

        return shared;
    })();

    return u2;
})();

export { $root as default };
