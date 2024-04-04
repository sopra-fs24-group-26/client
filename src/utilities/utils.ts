/**
 * Copyright (C) - All Rights Reserved
 * Written by Noah Mattia Bussinger, October 2023
 */

import { int, float, UUID, Nullable,EmptyCallback } from "../definitions/utils.js";
import Phaser from "phaser";

export const PHI: float = (1 + 5 ** 0.5) / 2;

export const toAngle: float = 180 / Math.PI;
export const toRadian: float = Math.PI / 180;

export function normalizeRadian(value: float): float {
    value = value % (2 * Math.PI);
    if (value < 0) {
        value += 2 * Math.PI;
    }
    return value;
}

export function UUIDv4(): UUID {
    return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c: any) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16),
    );
}

export function between(
    value: int | float,
    lower: int | float,
    upper: int | float,
): boolean {
    return value > Math.min(lower, upper) && value < Math.max(lower, upper);
}

export function dotit(value: int | float | string): string {
    value = typeof value === "string" ? value : value.toFixed(0);
    return value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1'");
}

export function clamp(
    value: int | float,
    min: int | float,
    max: int | float,
): float {
    return Math.min(Math.max(value, min), max) as float;
}

export function firstLetterUppercase(value: string): string {
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function replaceAt(
    value: string,
    index: int,
    replacement: string,
): string {
    return `${value.substring(0, index)}${replacement}${value.substring(
        index + replacement.length,
    )}`;
}

export function toHexadecimal(value: string): int {
    return Number(`0x${value.split("#")[1]}`);
}

export function count<T>(value: T[], target: T): int {
    return value.filter((x: T): boolean => x === target).length;
}

export function swapRemove<T>(value: T[], at: int): T[] {
    value[at] = value[value.length - 1];
    value.pop();
    return value;
}

export function clear<T>(value: T[]): T[] {
    value.length = 0;
    return value;
}

export function assert(
    condition: any,
    msg: Nullable<string> = null,
): asserts condition {
    if (!condition) {
        throw new Error(msg || "Assertion");
    }
}

export async function fileExists(path: string): Promise<boolean> {
    return await fetch(path, { method: "HEAD" }).then(
        async (response: Response) => response.ok,
    );
}

export async function fileLoad(path: string): Promise<string> {
    return await fetch(path).then(
        async (response: Response) => await response.text(),
    );
}

export function msToFps(ms: float): string {
    return dotit(1_000 / ms);
}

export async function sleep(ms: int): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getSafeArea(key: string): int {
    return parseInt(
        getComputedStyle(document.documentElement)
            .getPropertyValue(key)
            .split("px")[0],
    );
}

export function romanize(value: int): string {
    const digits: string[] = String(+value).split("");
    // prettier-ignore
    const key: string[] = [
        "", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
        "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
        "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"
    ];
    let roman: string = "";
    let i: int = 3;
    while (i--) {
        // @ts-ignore
        roman = (key[+digits.pop() + i * 10] || "") + roman;
    }
    return Array(+digits.join("") + 1).join("M") + roman;
}

export function deepImmutable<T extends object>(root: T): T {
    for (const key of Object.keys(root)) {
        const value: any = root[key as keyof T];
        if (typeof value === "object") {
            deepImmutable(value);
        }
    }
    return Object.freeze(root);
}
export function interactify(
    image: Phaser.GameObjects.Image,
    scale: float,
    callback: EmptyCallback,
): void {
    let dirty: boolean = true;
    function expand(): void {
        dirty = true;
        image.setScale(scale);
    }
    function shrink(): void {
        dirty = false;
        image.setScale(scale * 0.9);
    }
    function up(): void {
        const wasDirty: boolean = dirty;
        expand();
        if (wasDirty) {
            return;
        }
        callback();
    }
    image.setInteractive();
    image.on("pointerdown", shrink);
    image.on("pointerup", up);
    image.on("pointerout", expand);
    image.on("pointercancel", expand);
    image.setScale(scale);
}
