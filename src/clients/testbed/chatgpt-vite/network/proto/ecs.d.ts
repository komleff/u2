import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace u2. */
export namespace u2 {

    /** Namespace shared. */
    namespace shared {

        /** Namespace proto. */
        namespace proto {

            /** Properties of a Vector2Proto. */
            interface IVector2Proto {

                /** Vector2Proto x */
                x?: (number|null);

                /** Vector2Proto y */
                y?: (number|null);
            }

            /** Represents a Vector2Proto. */
            class Vector2Proto implements IVector2Proto {

                /**
                 * Constructs a new Vector2Proto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IVector2Proto);

                /** Vector2Proto x. */
                public x: number;

                /** Vector2Proto y. */
                public y: number;

                /**
                 * Creates a new Vector2Proto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Vector2Proto instance
                 */
                public static create(properties?: u2.shared.proto.IVector2Proto): u2.shared.proto.Vector2Proto;

                /**
                 * Encodes the specified Vector2Proto message. Does not implicitly {@link u2.shared.proto.Vector2Proto.verify|verify} messages.
                 * @param message Vector2Proto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IVector2Proto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Vector2Proto message, length delimited. Does not implicitly {@link u2.shared.proto.Vector2Proto.verify|verify} messages.
                 * @param message Vector2Proto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IVector2Proto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Vector2Proto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Vector2Proto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.Vector2Proto;

                /**
                 * Decodes a Vector2Proto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Vector2Proto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.Vector2Proto;

                /**
                 * Verifies a Vector2Proto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Vector2Proto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Vector2Proto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.Vector2Proto;

                /**
                 * Creates a plain object from a Vector2Proto message. Also converts values to other types if specified.
                 * @param message Vector2Proto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.Vector2Proto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Vector2Proto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Vector2Proto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a Transform2DProto. */
            interface ITransform2DProto {

                /** Transform2DProto position */
                position?: (u2.shared.proto.IVector2Proto|null);

                /** Transform2DProto rotation */
                rotation?: (number|null);
            }

            /** Represents a Transform2DProto. */
            class Transform2DProto implements ITransform2DProto {

                /**
                 * Constructs a new Transform2DProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.ITransform2DProto);

                /** Transform2DProto position. */
                public position?: (u2.shared.proto.IVector2Proto|null);

                /** Transform2DProto rotation. */
                public rotation: number;

                /**
                 * Creates a new Transform2DProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Transform2DProto instance
                 */
                public static create(properties?: u2.shared.proto.ITransform2DProto): u2.shared.proto.Transform2DProto;

                /**
                 * Encodes the specified Transform2DProto message. Does not implicitly {@link u2.shared.proto.Transform2DProto.verify|verify} messages.
                 * @param message Transform2DProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.ITransform2DProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Transform2DProto message, length delimited. Does not implicitly {@link u2.shared.proto.Transform2DProto.verify|verify} messages.
                 * @param message Transform2DProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.ITransform2DProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Transform2DProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Transform2DProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.Transform2DProto;

                /**
                 * Decodes a Transform2DProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Transform2DProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.Transform2DProto;

                /**
                 * Verifies a Transform2DProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Transform2DProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Transform2DProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.Transform2DProto;

                /**
                 * Creates a plain object from a Transform2DProto message. Also converts values to other types if specified.
                 * @param message Transform2DProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.Transform2DProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Transform2DProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Transform2DProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a VelocityProto. */
            interface IVelocityProto {

                /** VelocityProto linear */
                linear?: (u2.shared.proto.IVector2Proto|null);

                /** VelocityProto angular */
                angular?: (number|null);
            }

            /** Represents a VelocityProto. */
            class VelocityProto implements IVelocityProto {

                /**
                 * Constructs a new VelocityProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IVelocityProto);

                /** VelocityProto linear. */
                public linear?: (u2.shared.proto.IVector2Proto|null);

                /** VelocityProto angular. */
                public angular: number;

                /**
                 * Creates a new VelocityProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns VelocityProto instance
                 */
                public static create(properties?: u2.shared.proto.IVelocityProto): u2.shared.proto.VelocityProto;

                /**
                 * Encodes the specified VelocityProto message. Does not implicitly {@link u2.shared.proto.VelocityProto.verify|verify} messages.
                 * @param message VelocityProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IVelocityProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified VelocityProto message, length delimited. Does not implicitly {@link u2.shared.proto.VelocityProto.verify|verify} messages.
                 * @param message VelocityProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IVelocityProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a VelocityProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns VelocityProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.VelocityProto;

                /**
                 * Decodes a VelocityProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns VelocityProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.VelocityProto;

                /**
                 * Verifies a VelocityProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a VelocityProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns VelocityProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.VelocityProto;

                /**
                 * Creates a plain object from a VelocityProto message. Also converts values to other types if specified.
                 * @param message VelocityProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.VelocityProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this VelocityProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for VelocityProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a MassProto. */
            interface IMassProto {

                /** MassProto massKg */
                massKg?: (number|null);

                /** MassProto inertiaKgm2 */
                inertiaKgm2?: (number|null);
            }

            /** Represents a MassProto. */
            class MassProto implements IMassProto {

                /**
                 * Constructs a new MassProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IMassProto);

                /** MassProto massKg. */
                public massKg: number;

                /** MassProto inertiaKgm2. */
                public inertiaKgm2: number;

                /**
                 * Creates a new MassProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns MassProto instance
                 */
                public static create(properties?: u2.shared.proto.IMassProto): u2.shared.proto.MassProto;

                /**
                 * Encodes the specified MassProto message. Does not implicitly {@link u2.shared.proto.MassProto.verify|verify} messages.
                 * @param message MassProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IMassProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MassProto message, length delimited. Does not implicitly {@link u2.shared.proto.MassProto.verify|verify} messages.
                 * @param message MassProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IMassProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MassProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MassProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.MassProto;

                /**
                 * Decodes a MassProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MassProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.MassProto;

                /**
                 * Verifies a MassProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MassProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MassProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.MassProto;

                /**
                 * Creates a plain object from a MassProto message. Also converts values to other types if specified.
                 * @param message MassProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.MassProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MassProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for MassProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ControlStateProto. */
            interface IControlStateProto {

                /** ControlStateProto thrust */
                thrust?: (number|null);

                /** ControlStateProto strafeX */
                strafeX?: (number|null);

                /** ControlStateProto strafeY */
                strafeY?: (number|null);

                /** ControlStateProto yawInput */
                yawInput?: (number|null);

                /** ControlStateProto brake */
                brake?: (boolean|null);
            }

            /** Represents a ControlStateProto. */
            class ControlStateProto implements IControlStateProto {

                /**
                 * Constructs a new ControlStateProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IControlStateProto);

                /** ControlStateProto thrust. */
                public thrust: number;

                /** ControlStateProto strafeX. */
                public strafeX: number;

                /** ControlStateProto strafeY. */
                public strafeY: number;

                /** ControlStateProto yawInput. */
                public yawInput: number;

                /** ControlStateProto brake. */
                public brake: boolean;

                /**
                 * Creates a new ControlStateProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ControlStateProto instance
                 */
                public static create(properties?: u2.shared.proto.IControlStateProto): u2.shared.proto.ControlStateProto;

                /**
                 * Encodes the specified ControlStateProto message. Does not implicitly {@link u2.shared.proto.ControlStateProto.verify|verify} messages.
                 * @param message ControlStateProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IControlStateProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ControlStateProto message, length delimited. Does not implicitly {@link u2.shared.proto.ControlStateProto.verify|verify} messages.
                 * @param message ControlStateProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IControlStateProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ControlStateProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ControlStateProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.ControlStateProto;

                /**
                 * Decodes a ControlStateProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ControlStateProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.ControlStateProto;

                /**
                 * Verifies a ControlStateProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ControlStateProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ControlStateProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.ControlStateProto;

                /**
                 * Creates a plain object from a ControlStateProto message. Also converts values to other types if specified.
                 * @param message ControlStateProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.ControlStateProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ControlStateProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ControlStateProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a FlightAssistProto. */
            interface IFlightAssistProto {

                /** FlightAssistProto enabled */
                enabled?: (boolean|null);
            }

            /** Represents a FlightAssistProto. */
            class FlightAssistProto implements IFlightAssistProto {

                /**
                 * Constructs a new FlightAssistProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IFlightAssistProto);

                /** FlightAssistProto enabled. */
                public enabled: boolean;

                /**
                 * Creates a new FlightAssistProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FlightAssistProto instance
                 */
                public static create(properties?: u2.shared.proto.IFlightAssistProto): u2.shared.proto.FlightAssistProto;

                /**
                 * Encodes the specified FlightAssistProto message. Does not implicitly {@link u2.shared.proto.FlightAssistProto.verify|verify} messages.
                 * @param message FlightAssistProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IFlightAssistProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FlightAssistProto message, length delimited. Does not implicitly {@link u2.shared.proto.FlightAssistProto.verify|verify} messages.
                 * @param message FlightAssistProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IFlightAssistProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FlightAssistProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FlightAssistProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.FlightAssistProto;

                /**
                 * Decodes a FlightAssistProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FlightAssistProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.FlightAssistProto;

                /**
                 * Verifies a FlightAssistProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FlightAssistProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FlightAssistProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.FlightAssistProto;

                /**
                 * Creates a plain object from a FlightAssistProto message. Also converts values to other types if specified.
                 * @param message FlightAssistProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.FlightAssistProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FlightAssistProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FlightAssistProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a HealthProto. */
            interface IHealthProto {

                /** HealthProto currentHp */
                currentHp?: (number|null);

                /** HealthProto maxHp */
                maxHp?: (number|null);
            }

            /** Represents a HealthProto. */
            class HealthProto implements IHealthProto {

                /**
                 * Constructs a new HealthProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IHealthProto);

                /** HealthProto currentHp. */
                public currentHp: number;

                /** HealthProto maxHp. */
                public maxHp: number;

                /**
                 * Creates a new HealthProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns HealthProto instance
                 */
                public static create(properties?: u2.shared.proto.IHealthProto): u2.shared.proto.HealthProto;

                /**
                 * Encodes the specified HealthProto message. Does not implicitly {@link u2.shared.proto.HealthProto.verify|verify} messages.
                 * @param message HealthProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IHealthProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified HealthProto message, length delimited. Does not implicitly {@link u2.shared.proto.HealthProto.verify|verify} messages.
                 * @param message HealthProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IHealthProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a HealthProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns HealthProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.HealthProto;

                /**
                 * Decodes a HealthProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns HealthProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.HealthProto;

                /**
                 * Verifies a HealthProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a HealthProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns HealthProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.HealthProto;

                /**
                 * Creates a plain object from a HealthProto message. Also converts values to other types if specified.
                 * @param message HealthProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.HealthProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this HealthProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for HealthProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an EntitySnapshotProto. */
            interface IEntitySnapshotProto {

                /** EntitySnapshotProto entityId */
                entityId?: (number|null);

                /** EntitySnapshotProto transform */
                transform?: (u2.shared.proto.ITransform2DProto|null);

                /** EntitySnapshotProto velocity */
                velocity?: (u2.shared.proto.IVelocityProto|null);

                /** EntitySnapshotProto controlState */
                controlState?: (u2.shared.proto.IControlStateProto|null);

                /** EntitySnapshotProto flightAssist */
                flightAssist?: (u2.shared.proto.IFlightAssistProto|null);

                /** EntitySnapshotProto health */
                health?: (u2.shared.proto.IHealthProto|null);

                /** EntitySnapshotProto lastProcessedSequence */
                lastProcessedSequence?: (number|null);
            }

            /** Represents an EntitySnapshotProto. */
            class EntitySnapshotProto implements IEntitySnapshotProto {

                /**
                 * Constructs a new EntitySnapshotProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IEntitySnapshotProto);

                /** EntitySnapshotProto entityId. */
                public entityId: number;

                /** EntitySnapshotProto transform. */
                public transform?: (u2.shared.proto.ITransform2DProto|null);

                /** EntitySnapshotProto velocity. */
                public velocity?: (u2.shared.proto.IVelocityProto|null);

                /** EntitySnapshotProto controlState. */
                public controlState?: (u2.shared.proto.IControlStateProto|null);

                /** EntitySnapshotProto flightAssist. */
                public flightAssist?: (u2.shared.proto.IFlightAssistProto|null);

                /** EntitySnapshotProto health. */
                public health?: (u2.shared.proto.IHealthProto|null);

                /** EntitySnapshotProto lastProcessedSequence. */
                public lastProcessedSequence: number;

                /**
                 * Creates a new EntitySnapshotProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns EntitySnapshotProto instance
                 */
                public static create(properties?: u2.shared.proto.IEntitySnapshotProto): u2.shared.proto.EntitySnapshotProto;

                /**
                 * Encodes the specified EntitySnapshotProto message. Does not implicitly {@link u2.shared.proto.EntitySnapshotProto.verify|verify} messages.
                 * @param message EntitySnapshotProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IEntitySnapshotProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EntitySnapshotProto message, length delimited. Does not implicitly {@link u2.shared.proto.EntitySnapshotProto.verify|verify} messages.
                 * @param message EntitySnapshotProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IEntitySnapshotProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EntitySnapshotProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EntitySnapshotProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.EntitySnapshotProto;

                /**
                 * Decodes an EntitySnapshotProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EntitySnapshotProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.EntitySnapshotProto;

                /**
                 * Verifies an EntitySnapshotProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EntitySnapshotProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EntitySnapshotProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.EntitySnapshotProto;

                /**
                 * Creates a plain object from an EntitySnapshotProto message. Also converts values to other types if specified.
                 * @param message EntitySnapshotProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.EntitySnapshotProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EntitySnapshotProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for EntitySnapshotProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a WorldSnapshotProto. */
            interface IWorldSnapshotProto {

                /** WorldSnapshotProto tick */
                tick?: (number|null);

                /** WorldSnapshotProto timestampMs */
                timestampMs?: (number|Long|null);

                /** WorldSnapshotProto entities */
                entities?: (u2.shared.proto.IEntitySnapshotProto[]|null);
            }

            /** Represents a WorldSnapshotProto. */
            class WorldSnapshotProto implements IWorldSnapshotProto {

                /**
                 * Constructs a new WorldSnapshotProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IWorldSnapshotProto);

                /** WorldSnapshotProto tick. */
                public tick: number;

                /** WorldSnapshotProto timestampMs. */
                public timestampMs: (number|Long);

                /** WorldSnapshotProto entities. */
                public entities: u2.shared.proto.IEntitySnapshotProto[];

                /**
                 * Creates a new WorldSnapshotProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns WorldSnapshotProto instance
                 */
                public static create(properties?: u2.shared.proto.IWorldSnapshotProto): u2.shared.proto.WorldSnapshotProto;

                /**
                 * Encodes the specified WorldSnapshotProto message. Does not implicitly {@link u2.shared.proto.WorldSnapshotProto.verify|verify} messages.
                 * @param message WorldSnapshotProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IWorldSnapshotProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified WorldSnapshotProto message, length delimited. Does not implicitly {@link u2.shared.proto.WorldSnapshotProto.verify|verify} messages.
                 * @param message WorldSnapshotProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IWorldSnapshotProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a WorldSnapshotProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns WorldSnapshotProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.WorldSnapshotProto;

                /**
                 * Decodes a WorldSnapshotProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns WorldSnapshotProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.WorldSnapshotProto;

                /**
                 * Verifies a WorldSnapshotProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a WorldSnapshotProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns WorldSnapshotProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.WorldSnapshotProto;

                /**
                 * Creates a plain object from a WorldSnapshotProto message. Also converts values to other types if specified.
                 * @param message WorldSnapshotProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.WorldSnapshotProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this WorldSnapshotProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for WorldSnapshotProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a PlayerInputProto. */
            interface IPlayerInputProto {

                /** PlayerInputProto clientId */
                clientId?: (number|null);

                /** PlayerInputProto sequenceNumber */
                sequenceNumber?: (number|null);

                /** PlayerInputProto timestampMs */
                timestampMs?: (number|Long|null);

                /** PlayerInputProto controlState */
                controlState?: (u2.shared.proto.IControlStateProto|null);

                /** PlayerInputProto flightAssist */
                flightAssist?: (boolean|null);
            }

            /** Represents a PlayerInputProto. */
            class PlayerInputProto implements IPlayerInputProto {

                /**
                 * Constructs a new PlayerInputProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IPlayerInputProto);

                /** PlayerInputProto clientId. */
                public clientId: number;

                /** PlayerInputProto sequenceNumber. */
                public sequenceNumber: number;

                /** PlayerInputProto timestampMs. */
                public timestampMs: (number|Long);

                /** PlayerInputProto controlState. */
                public controlState?: (u2.shared.proto.IControlStateProto|null);

                /** PlayerInputProto flightAssist. */
                public flightAssist: boolean;

                /**
                 * Creates a new PlayerInputProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns PlayerInputProto instance
                 */
                public static create(properties?: u2.shared.proto.IPlayerInputProto): u2.shared.proto.PlayerInputProto;

                /**
                 * Encodes the specified PlayerInputProto message. Does not implicitly {@link u2.shared.proto.PlayerInputProto.verify|verify} messages.
                 * @param message PlayerInputProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IPlayerInputProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified PlayerInputProto message, length delimited. Does not implicitly {@link u2.shared.proto.PlayerInputProto.verify|verify} messages.
                 * @param message PlayerInputProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IPlayerInputProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a PlayerInputProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns PlayerInputProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.PlayerInputProto;

                /**
                 * Decodes a PlayerInputProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns PlayerInputProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.PlayerInputProto;

                /**
                 * Verifies a PlayerInputProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a PlayerInputProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns PlayerInputProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.PlayerInputProto;

                /**
                 * Creates a plain object from a PlayerInputProto message. Also converts values to other types if specified.
                 * @param message PlayerInputProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.PlayerInputProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this PlayerInputProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for PlayerInputProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ConnectionAcceptedProto. */
            interface IConnectionAcceptedProto {

                /** ConnectionAcceptedProto clientId */
                clientId?: (number|null);

                /** ConnectionAcceptedProto entityId */
                entityId?: (number|null);

                /** ConnectionAcceptedProto serverTimeMs */
                serverTimeMs?: (number|Long|null);
            }

            /** Represents a ConnectionAcceptedProto. */
            class ConnectionAcceptedProto implements IConnectionAcceptedProto {

                /**
                 * Constructs a new ConnectionAcceptedProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IConnectionAcceptedProto);

                /** ConnectionAcceptedProto clientId. */
                public clientId: number;

                /** ConnectionAcceptedProto entityId. */
                public entityId: number;

                /** ConnectionAcceptedProto serverTimeMs. */
                public serverTimeMs: (number|Long);

                /**
                 * Creates a new ConnectionAcceptedProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ConnectionAcceptedProto instance
                 */
                public static create(properties?: u2.shared.proto.IConnectionAcceptedProto): u2.shared.proto.ConnectionAcceptedProto;

                /**
                 * Encodes the specified ConnectionAcceptedProto message. Does not implicitly {@link u2.shared.proto.ConnectionAcceptedProto.verify|verify} messages.
                 * @param message ConnectionAcceptedProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IConnectionAcceptedProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ConnectionAcceptedProto message, length delimited. Does not implicitly {@link u2.shared.proto.ConnectionAcceptedProto.verify|verify} messages.
                 * @param message ConnectionAcceptedProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IConnectionAcceptedProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ConnectionAcceptedProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ConnectionAcceptedProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.ConnectionAcceptedProto;

                /**
                 * Decodes a ConnectionAcceptedProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ConnectionAcceptedProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.ConnectionAcceptedProto;

                /**
                 * Verifies a ConnectionAcceptedProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ConnectionAcceptedProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ConnectionAcceptedProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.ConnectionAcceptedProto;

                /**
                 * Creates a plain object from a ConnectionAcceptedProto message. Also converts values to other types if specified.
                 * @param message ConnectionAcceptedProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.ConnectionAcceptedProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ConnectionAcceptedProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ConnectionAcceptedProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ConnectionRequestProto. */
            interface IConnectionRequestProto {

                /** ConnectionRequestProto playerName */
                playerName?: (string|null);

                /** ConnectionRequestProto version */
                version?: (string|null);
            }

            /** Represents a ConnectionRequestProto. */
            class ConnectionRequestProto implements IConnectionRequestProto {

                /**
                 * Constructs a new ConnectionRequestProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IConnectionRequestProto);

                /** ConnectionRequestProto playerName. */
                public playerName: string;

                /** ConnectionRequestProto version. */
                public version: string;

                /**
                 * Creates a new ConnectionRequestProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ConnectionRequestProto instance
                 */
                public static create(properties?: u2.shared.proto.IConnectionRequestProto): u2.shared.proto.ConnectionRequestProto;

                /**
                 * Encodes the specified ConnectionRequestProto message. Does not implicitly {@link u2.shared.proto.ConnectionRequestProto.verify|verify} messages.
                 * @param message ConnectionRequestProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IConnectionRequestProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ConnectionRequestProto message, length delimited. Does not implicitly {@link u2.shared.proto.ConnectionRequestProto.verify|verify} messages.
                 * @param message ConnectionRequestProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IConnectionRequestProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ConnectionRequestProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ConnectionRequestProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.ConnectionRequestProto;

                /**
                 * Decodes a ConnectionRequestProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ConnectionRequestProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.ConnectionRequestProto;

                /**
                 * Verifies a ConnectionRequestProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ConnectionRequestProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ConnectionRequestProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.ConnectionRequestProto;

                /**
                 * Creates a plain object from a ConnectionRequestProto message. Also converts values to other types if specified.
                 * @param message ConnectionRequestProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.ConnectionRequestProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ConnectionRequestProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ConnectionRequestProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a DisconnectProto. */
            interface IDisconnectProto {

                /** DisconnectProto clientId */
                clientId?: (number|null);

                /** DisconnectProto reason */
                reason?: (string|null);
            }

            /** Represents a DisconnectProto. */
            class DisconnectProto implements IDisconnectProto {

                /**
                 * Constructs a new DisconnectProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IDisconnectProto);

                /** DisconnectProto clientId. */
                public clientId: number;

                /** DisconnectProto reason. */
                public reason: string;

                /**
                 * Creates a new DisconnectProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns DisconnectProto instance
                 */
                public static create(properties?: u2.shared.proto.IDisconnectProto): u2.shared.proto.DisconnectProto;

                /**
                 * Encodes the specified DisconnectProto message. Does not implicitly {@link u2.shared.proto.DisconnectProto.verify|verify} messages.
                 * @param message DisconnectProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IDisconnectProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified DisconnectProto message, length delimited. Does not implicitly {@link u2.shared.proto.DisconnectProto.verify|verify} messages.
                 * @param message DisconnectProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IDisconnectProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DisconnectProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DisconnectProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.DisconnectProto;

                /**
                 * Decodes a DisconnectProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns DisconnectProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.DisconnectProto;

                /**
                 * Verifies a DisconnectProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DisconnectProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DisconnectProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.DisconnectProto;

                /**
                 * Creates a plain object from a DisconnectProto message. Also converts values to other types if specified.
                 * @param message DisconnectProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.DisconnectProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DisconnectProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for DisconnectProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ClientMessageProto. */
            interface IClientMessageProto {

                /** ClientMessageProto connectionRequest */
                connectionRequest?: (u2.shared.proto.IConnectionRequestProto|null);

                /** ClientMessageProto playerInput */
                playerInput?: (u2.shared.proto.IPlayerInputProto|null);
            }

            /** Represents a ClientMessageProto. */
            class ClientMessageProto implements IClientMessageProto {

                /**
                 * Constructs a new ClientMessageProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IClientMessageProto);

                /** ClientMessageProto connectionRequest. */
                public connectionRequest?: (u2.shared.proto.IConnectionRequestProto|null);

                /** ClientMessageProto playerInput. */
                public playerInput?: (u2.shared.proto.IPlayerInputProto|null);

                /** ClientMessageProto message. */
                public message?: ("connectionRequest"|"playerInput");

                /**
                 * Creates a new ClientMessageProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ClientMessageProto instance
                 */
                public static create(properties?: u2.shared.proto.IClientMessageProto): u2.shared.proto.ClientMessageProto;

                /**
                 * Encodes the specified ClientMessageProto message. Does not implicitly {@link u2.shared.proto.ClientMessageProto.verify|verify} messages.
                 * @param message ClientMessageProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IClientMessageProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ClientMessageProto message, length delimited. Does not implicitly {@link u2.shared.proto.ClientMessageProto.verify|verify} messages.
                 * @param message ClientMessageProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IClientMessageProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ClientMessageProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ClientMessageProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.ClientMessageProto;

                /**
                 * Decodes a ClientMessageProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ClientMessageProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.ClientMessageProto;

                /**
                 * Verifies a ClientMessageProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ClientMessageProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ClientMessageProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.ClientMessageProto;

                /**
                 * Creates a plain object from a ClientMessageProto message. Also converts values to other types if specified.
                 * @param message ClientMessageProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.ClientMessageProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ClientMessageProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ClientMessageProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ServerMessageProto. */
            interface IServerMessageProto {

                /** ServerMessageProto connectionAccepted */
                connectionAccepted?: (u2.shared.proto.IConnectionAcceptedProto|null);

                /** ServerMessageProto worldSnapshot */
                worldSnapshot?: (u2.shared.proto.IWorldSnapshotProto|null);

                /** ServerMessageProto disconnect */
                disconnect?: (u2.shared.proto.IDisconnectProto|null);
            }

            /** Represents a ServerMessageProto. */
            class ServerMessageProto implements IServerMessageProto {

                /**
                 * Constructs a new ServerMessageProto.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: u2.shared.proto.IServerMessageProto);

                /** ServerMessageProto connectionAccepted. */
                public connectionAccepted?: (u2.shared.proto.IConnectionAcceptedProto|null);

                /** ServerMessageProto worldSnapshot. */
                public worldSnapshot?: (u2.shared.proto.IWorldSnapshotProto|null);

                /** ServerMessageProto disconnect. */
                public disconnect?: (u2.shared.proto.IDisconnectProto|null);

                /** ServerMessageProto message. */
                public message?: ("connectionAccepted"|"worldSnapshot"|"disconnect");

                /**
                 * Creates a new ServerMessageProto instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ServerMessageProto instance
                 */
                public static create(properties?: u2.shared.proto.IServerMessageProto): u2.shared.proto.ServerMessageProto;

                /**
                 * Encodes the specified ServerMessageProto message. Does not implicitly {@link u2.shared.proto.ServerMessageProto.verify|verify} messages.
                 * @param message ServerMessageProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: u2.shared.proto.IServerMessageProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ServerMessageProto message, length delimited. Does not implicitly {@link u2.shared.proto.ServerMessageProto.verify|verify} messages.
                 * @param message ServerMessageProto message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: u2.shared.proto.IServerMessageProto, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ServerMessageProto message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ServerMessageProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): u2.shared.proto.ServerMessageProto;

                /**
                 * Decodes a ServerMessageProto message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ServerMessageProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): u2.shared.proto.ServerMessageProto;

                /**
                 * Verifies a ServerMessageProto message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ServerMessageProto message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ServerMessageProto
                 */
                public static fromObject(object: { [k: string]: any }): u2.shared.proto.ServerMessageProto;

                /**
                 * Creates a plain object from a ServerMessageProto message. Also converts values to other types if specified.
                 * @param message ServerMessageProto
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: u2.shared.proto.ServerMessageProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ServerMessageProto to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ServerMessageProto
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }
    }
}
