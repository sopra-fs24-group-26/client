/**
 * Copyright (C) - All Rights Reserved
 * Written by Noah Mattia Bussinger, February 2022
 */

export type int = number & { __type?: "int" };

export type float = number & { __type?: "float" };

export type UID = number & { __type?: "uid" };

export type UUID = string & { __type?: "uuid" };

export type Key = string & { __type?: "key" };

export type Path = string & { __type?: "path" };

export type Nullable<T> = T | null;

export type FloatArray = float[] | Float32Array | Float64Array;

export type Modify<T, R> = Omit<T, keyof R> & R;
