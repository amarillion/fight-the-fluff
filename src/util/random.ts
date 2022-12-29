/** pick one from a list */
export function pickRandom<T>(list: T[]) {
	if (list.length === 0) return undefined;
	return list[Math.floor(Math.random() * list.length)];
}
