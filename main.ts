import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!


interface MyPluginSettings {
	WelcomeStr: string;// 插件的设置变量，把需要保存的一些变量放在里面
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	WelcomeStr: '欢迎来到 Obsidian'// 对上面设置的变量给一个默认值
}

// 插件的主要功能设置
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	//当插件开始加载时调用
	async onload() {
		await this.loadSettings();// 插件在被初始化的时候会加载设置内容

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		this.addCommand({
			id: 'simple-plugin-demo-command1',
			name: '尝试添加命令',
			callback: () => { 
				new Notice(this.settings.WelcomeStr);//创建一个新通知
				new SampleModal(this.app).open();//打开属于自己的面板
			}
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));//这一步就在插件设置列表中添加了我们的 “插件设置面板”

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	//当插件开始卸载时调用
	onunload() {

	}

	//加载 插件设置
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	//保存 插件设置
	async saveSettings() {
		await this.saveData(this.settings);
	}
}

//Modal：实现接口 CloseableComponent (可关闭组件) 的类，相当于 “面板”，程序构建实例的时候，会弹出一个面板，就是实例化的这个类对象
class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	//当插件面板被打开
	onOpen() {
		
		const title = this.titleEl;
		title.setText("当前打开的文档名称");
		
		const { contentEl } = this;
		contentEl.setText(this.app.workspace.getActiveFile().name);// 获取当前激活的文件名称
	}

	//当插件面板被关闭
	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

// 插件设置页面，这个类负责构造插件 “设置页面” 的面板内容，可以在这个类中 对 “MyPluginSettings” 中设置的变量赋值
class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	//动态生成一个 html 页面
	display(): void {
		const {containerEl} = this;

		containerEl.empty();//初始化容器

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});//构造一个 h2 标题

		new Setting(containerEl) //构造一个设置项
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.WelcomeStr)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.WelcomeStr = value;
					await this.plugin.saveSettings();// 构造了一个 Setting 的输出框，然后传入了一个 lambda 函数到 OnChange 函数内，用来响应数值改变后要做什么操作
				}));
	}
}
