// credit to @navtoj for getting the keys from a zod object
// https://github.com/colinhacks/zod/discussions/2134#discussioncomment-5194111

import { z } from "zod";
import { animal as animalDict } from 'memorable-moniker/dist/dict/animal';
import { describe, type TestAPI } from "vitest";
import { inspect } from 'node:util';

// get zod object keys recursively
export function zodKeys<T extends z.ZodTypeAny>(schema: T): string[] {
	// make sure schema is not null or undefined
	if (schema === null || schema === undefined) return [];
	// check if schema is nullable or optional
	if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) return zodKeys(schema.unwrap());
	// check if schema is an array
	if (schema instanceof z.ZodArray) return zodKeys(schema.element);
	// check if schema is an object
	if (schema instanceof z.ZodObject) {
		// get key/value pairs from schema
		const entries = Object.entries(schema.shape);
		// loop through key/value pairs
		return entries.flatMap(([key, value]) => {
			// get nested keys
			const nested = value instanceof z.ZodType ? zodKeys(value).map(subKey => `${key}.${subKey}`) : [];
			// return nested keys
			return nested.length ? nested : key;
		});
	}
	// return empty array
	return [];
};

type Matrix = Record<string, [unknown, unknown, ...unknown[]]>
type MatrixWithConfig<TMatrix extends Matrix> = { matrix: TMatrix, addHumanFriendlyName?: boolean };

type MatrixResult<TMatrix extends Matrix> = { [T in keyof TMatrix]: TMatrix[T][number] };
type MatrixResultEntryRecord<TMatrix extends Matrix> = { [T in keyof TMatrix]: [T, TMatrix[T][number]] };
type MatrixResultEntry<TMatrix extends Matrix> = MatrixResultEntryRecord<TMatrix>[keyof MatrixResultEntryRecord<TMatrix>];

type CurrentMatrixPositionsMap<TMatrix extends Matrix> = { [T in keyof TMatrix]: [T, number] };
type CurrentMatrixPositions<TMatrix extends Matrix> = CurrentMatrixPositionsMap<TMatrix>[keyof CurrentMatrixPositionsMap<TMatrix>][];
type MatrixState<TMatrix extends Matrix> = {
	positions: CurrentMatrixPositions<TMatrix>;
	seqId: number;
	getHumanFriendlyName: () => string;
}

type MatrixFunction<TMatrix extends Matrix> = (matrix: MatrixResult<TMatrix>, testApi: TestAPI<object>, sequentialId: number, humanFriendlyName: string) => void | Promise<void>;

export function describeMatrix<TMatrix extends Matrix>(matrixWithConfig: MatrixWithConfig<TMatrix>, fn: MatrixFunction<TMatrix>) {
	const matrixState: MatrixState<TMatrix> = {
		positions: Object.keys(matrixWithConfig.matrix).map(key => [key, 0] as const),
		seqId: -1,
		getHumanFriendlyName: () => {
			const animal = animalDict[(matrixState.seqId as number) % animalDict.length];
			return `${animal}-${Math.floor(matrixState.seqId / animalDict.length) + 1}`;
		}
	}

	describeMatrixDelegate(matrixWithConfig, fn, matrixState, 0);
}

/**
 * A delegate to handle a single key in the matrix. Uses recursion to handle every key in the matrix.
 */
function describeMatrixDelegate<TMatrix extends Matrix>(matrixWithConfig: MatrixWithConfig<TMatrix>, fn: MatrixFunction<TMatrix>, matrixState: MatrixState<TMatrix>, i: number) {
	if (i === matrixState.positions.length) {
		describeMatrixRunFunction(matrixWithConfig, fn, matrixState);
		return;
	}

	const positionsTuple = matrixState.positions[i]!;
	const key = positionsTuple[0];

	for (let j = 0; j < matrixWithConfig.matrix[key]!.length; j++) {
		positionsTuple[1] = j;
		describeMatrixDelegate(matrixWithConfig, fn, matrixState, i + 1);
	}
}

/**
 * Describe the matrix test block and provide the matrix to the provided function
 */
function describeMatrixRunFunction<TMatrix extends Matrix>(matrixWithConfig: MatrixWithConfig<TMatrix>, fn: MatrixFunction<TMatrix>, matrixState: MatrixState<TMatrix>) {
	matrixState.seqId++;

	const humanFriendly = matrixState.getHumanFriendlyName();

	const matrixResult = Object.fromEntries(matrixState.positions.map(([key, index]) => [key, matrixWithConfig.matrix[key]![index]!] satisfies MatrixResultEntry<TMatrix>)) as MatrixResult<TMatrix>;

	const matrixDataString = Object.entries(matrixResult).map(([key, value]) => `${key as string}: ${inspect(value, {
		breakLength: Infinity,
		colors: false,
		compact: true,
		depth: 1,
		numericSeparator: true,
	})}`).join(', ');

	describe(matrixWithConfig.addHumanFriendlyName === false ? matrixDataString : `${humanFriendly} ${matrixDataString}`, async (test) => {
		await fn(matrixResult, test, matrixState.seqId, humanFriendly);
	});
}
