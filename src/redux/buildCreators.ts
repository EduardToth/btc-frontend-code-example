/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Except } from 'type-fest';
import { identity, mapValues } from 'lodash';
import { Opaque } from 'type-fest';
import { State } from './types';


export interface Creator<Args extends any[] = any[], Return extends { type: unknown } = { type: unknown }> {
	(...args: Args): Return;
}

export interface AutoCreator<Args extends any[] = any[], Return extends object = object> {
	(...args: Args): Return;
}

export type AbstractCreatorDescriptor<Prefix extends string, Keys extends keyof any> = {
	[Key in Keys]: Key extends string ? Creator<any[], { type: `${Prefix}.${Key}` }> : never;
};

export type AutoAbstractCreatorDescriptorChecker<T extends AutoAbstractCreatorDescriptor> = {
	[Key in keyof T]: T[Key] extends AutoCreator<infer Params, infer Return>
		? Return extends { type: any }
			? AutoCreator<Params, Except<Return, 'type'> & { type: never }>
			: T[Key]
		: AutoCreator;
};
export interface AutoAbstractCreatorDescriptor {
	[key: string]: AutoCreator;
	[key: number | symbol]: never;
}

export interface SimpleCreatorDescriptor {
	[key: string]: object | null;
	[key: number | symbol]: never;
}

export type KeySetFromSimpleCreatorDescriptor<Descriptor extends SimpleCreatorDescriptor> = {
	[K in keyof Descriptor]: null;
};

export type SimpleCreatorsFromSimpleCreatorDescriptor<Descriptor extends SimpleCreatorDescriptor> = {
	[Key in keyof Descriptor]: Descriptor[Key] extends null ? () => {} : (params: Descriptor[Key]) => Descriptor[Key];
};

export type AbstractThunkDescriptor<
	State = any,
	Actions extends Action<string> = Action<string>,
	Thunk = ThunkAction<void, State, unknown, Actions>,
> = {
	[key: string]: (...args: any[]) => Thunk;
	[key: number | symbol]: never;
};

/**
 * Extract all action types from an action creator object built by buildCreators
 */
export type AllActions<Descriptor extends AbstractCreatorDescriptor<any, any>> = {
	[K in keyof Descriptor]: Descriptor[K] extends (...args: any) => any ? ReturnType<Descriptor[K]> : never;
}[keyof Descriptor];

/**
 * Filter a specifc action object out of an AbstractCreatorDescriptor.
 * Basically only useful as basis type for specific types, e.g.
 * type MyAction<Key extends keyof MyDescriptor> = FilterAction<MyDescriptor, Key>
 */
export type FilterAction<
	Descriptor extends AbstractCreatorDescriptor<any, any>,
	Filter extends keyof Descriptor,
> = ReturnType<Descriptor[Filter]>;

/**
 * Extracts all types from an action creator object built by buildCreators
 */
export type AllTypes<Descriptor extends AbstractCreatorDescriptor<any, any>> = AllActions<Descriptor>['type'];

/**
 * Adds or replaces the type of "type" attribute in the given object by the given Type parameter.
 */
type SetOrReplaceTypeAttribute<Object extends object, Type> = {
	[K in keyof Object | 'type']: K extends 'type'
		? Type
		: K extends keyof Object // this is always true, because "type" is the only possible exception and already handled
		? Object[K]
		: never;
};

/**
 * Maps the AutoCreatorDescriptor functions that create objects without "type" attribute
 * to functions that create objects with the correct type attribute.
 */
type MapAutoCreatorDescriptor<Prefix extends string, AutoCreatorDescriptor extends AutoAbstractCreatorDescriptor> = {
	[K in keyof AutoCreatorDescriptor]: K extends string
		? (
				...args: Parameters<AutoCreatorDescriptor[K]>
		  ) => SetOrReplaceTypeAttribute<ReturnType<AutoCreatorDescriptor[K]>, `${Prefix}.${K}`>
		: never;
};

/**
 * Extract all "type" attributes of the actions created by the action creators.
 */
type ExtractConstants<Descriptor extends AbstractCreatorDescriptor<any, any>> = {
	[K in keyof Descriptor]: Descriptor[K] extends (...args: any) => any ? ReturnType<Descriptor[K]>['type'] : never;
};

/**
 * Create the type guard for all actions given in an AbstractCreatorDescriptor
 */
type Guard<Descriptor extends AbstractCreatorDescriptor<any, any>> = (x: {
	type: unknown;
}) => x is AllActions<Descriptor>;

/**
 * Combine an AbstractCreatorDescriptor, AbstractThunkDescriptor and a TypeGuard to
 * a overall descriptor object containing every action and helpers.
 */
type ExtendedDescriptor<
	CreatorDescriptor extends AbstractCreatorDescriptor<string, keyof CreatorDescriptor & string>,
	ThunkDescriptor extends AbstractThunkDescriptor,
	TypeGuard extends string,
> = TypeGuard extends keyof CreatorDescriptor | keyof ThunkDescriptor | 'types'
	? 'TypeGuard needs to be different from existing keys in the descriptors and cannot be "types"'
	: {
			[K in keyof CreatorDescriptor | keyof ThunkDescriptor | 'types' | TypeGuard]: 'types' extends K
				? ExtractConstants<CreatorDescriptor>
				: TypeGuard extends K
				? Guard<CreatorDescriptor>
				: K extends keyof ThunkDescriptor
				? ThunkDescriptor[K]
				: K extends keyof CreatorDescriptor
				? CreatorDescriptor[K]
				: never;
	  };

export abstract class ActionCreatorBuilderBase<State, Prefix extends string, TypeGuard extends string> {
	constructor(private prefix: Prefix, private typeGuard: TypeGuard) {}

	createType<Name extends string>(name: Name) {
		return `${this.prefix}.${name}` as `${Prefix}.${Name}`;
	}

	createCreatorDescriptor<
		AutoCreatorDescriptor extends AutoAbstractCreatorDescriptor &
			AutoAbstractCreatorDescriptorChecker<AutoCreatorDescriptor>,
	>(creator: AutoCreatorDescriptor): MapAutoCreatorDescriptor<Prefix, typeof creator> {
		return mapValues(creator, (originalFunction, key) => {
			const type = this.createType(key);

			return (...args: Parameters<typeof originalFunction & Function>) => {
				const originalResult = originalFunction(...args);
				return {
					...originalResult,
					type,
				};
			};
		}) as unknown as MapAutoCreatorDescriptor<Prefix, typeof creator>;
	}

	createSimpleCreators<Creators extends SimpleCreatorDescriptor>(
		descriptor: KeySetFromSimpleCreatorDescriptor<Creators>,
	): SimpleCreatorsFromSimpleCreatorDescriptor<Creators> {
		return Object.keys(descriptor).reduce(
			(previous, currentKey) => ({ ...previous, [currentKey]: identityOrEmptyObject }),
			{},
		) as SimpleCreatorsFromSimpleCreatorDescriptor<Creators>;
	}

	createThunkDescriptor<Descriptor extends AbstractThunkDescriptor<State>>(descriptor: Descriptor): Descriptor {
		return descriptor;
	}

	createCreators<
		CreatorDescriptor extends AbstractCreatorDescriptor<Prefix, keyof CreatorDescriptor>,
		ThunkDescriptor extends AbstractThunkDescriptor<State>,
	>(creators: CreatorDescriptor, thunks: ThunkDescriptor) {
		const creatorKeys = Object.keys(creators);
		const types = creatorKeys.map((creator) => `${this.prefix}.${creator}`);

		return {
			...creators,
			...thunks,
			types: creatorKeys.reduce((previous, action) => ({ ...previous, [action]: `${this.prefix}.${action}` }), {}),
			[this.typeGuard](x: { type: unknown }): x is AllActions<CreatorDescriptor> {
				return typeof x.type === 'string' && types.includes(x.type);
			},
		} as unknown as ExtendedDescriptor<CreatorDescriptor, ThunkDescriptor, TypeGuard>;
	}
}

export class ActionCreatorBuilder<Prefix extends string, TypeGuard extends string> extends ActionCreatorBuilderBase<State, Prefix, TypeGuard> {}

function identityOrEmptyObject(objectOrUndefined: undefined): {};
function identityOrEmptyObject<T>(objectOrUndefined: T): T;
function identityOrEmptyObject(objectOrUndefined: any = {}) {
	return objectOrUndefined;
}

export function createSimpleActionCreator<ActionData extends object>(): (action: ActionData) => ActionData {
	return identity;
}

const EMPTY_OBJECT = Object.freeze({});
export const EMPTY_ACTION_CREATOR = () => EMPTY_OBJECT;

export type SimpleCreator<X extends object> = Opaque<(param: X) => X, 'SimpleCreator'>;
// this is a lie, but it will force allow using this variable as SimpleCreator while
// similar unwanted values are forbidden
export const SIMPLE_ACTION_CREATOR = identity as unknown as SimpleCreator<any>;
