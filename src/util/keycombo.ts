
export type KeyCodeRegistryType = { code: RegExp, action: (match: string) => void };
export class KeyCombo {

	private inputChars: string[] = [];
	private readonly registry: KeyCodeRegistryType[];

	constructor(...registry: KeyCodeRegistryType[]) {
		this.registry = registry;
	}

	register(code: RegExp, action: (match: string) => void) {
		this.registry.push({ code, action });
	}

	onKeyPress(char: string) {
		this.inputChars.push(char);
		if (this.inputChars.length > 20) { this.inputChars.shift(); }
		const input = this.inputChars.join('');
		for (const entry of this.registry) {
			const matcher = input.match(entry.code);
			if (matcher) {
				this.inputChars = [];
				entry.action(matcher[0]);
				break;
			}
		}
	}
}
