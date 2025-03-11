export default class {
	constructor() {

	}

	setTitle(title: string)
	{
		document.title = title;
	}

	async getHtml(): Promise<string>
	{
		return "";
	}
}