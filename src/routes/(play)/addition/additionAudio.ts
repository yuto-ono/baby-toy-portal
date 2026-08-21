export function getNumberAudioPath(value: number, basePath = '') {
	return `${basePath}/audio/addition/numbers/${value}.mp3`;
}

export function getEquationAudioPath(left: number, right: number, basePath = '') {
	return `${basePath}/audio/addition/equations/${left}-plus-${right}.mp3`;
}

export function getMagicAudioPath(basePath = '') {
	return `${basePath}/audio/addition/magic.mp3`;
}
