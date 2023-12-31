import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { Refs } from '../Types.js';
import { its, parseSchema } from './parseSchema.js';

export const parseAnyOf = (
    schema: JSONSchema7 & { anyOf: JSONSchema7Definition[] },
    refs: Refs,
    is_input: boolean
) => {
    if (!schema.anyOf.length) {
        return 'z.any()';
    } else if (schema.anyOf.length === 1) {
        return parseSchema(
            schema.anyOf[0],
            {
                ...refs,
                path: [...refs.path, 'anyOf', 0],
            },
            is_input
        );
    } else {
        let typeFiltered = schema.anyOf.filter((type) =>
            typeof type === 'object' ? !its.a.primitive(type, 'null') : true
        );
        let hasNull = typeFiltered.length < schema.anyOf.length;
        let only = typeFiltered.length === 1 ? typeFiltered[0] : null;
        if (only) {
            return `${parseSchema(
                only,
                {
                    ...refs,
                    path: [...refs.path, 'anyOf', 0],
                },
                is_input
            )}.nullable()`;
        }
        return `z.union([${schema.anyOf.map((schema, i) =>
            parseSchema(
                schema,
                { ...refs, path: [...refs.path, 'anyOf', i] },
                is_input
            )
        )}])${hasNull ? '.nullable()' : ''}`;
    }
};
