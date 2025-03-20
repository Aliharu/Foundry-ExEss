const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class TemplateImporter extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(type) {
    super(type);

    this.data = {
      test: '',
      folder: '',
      folders: [],
      errorText: '',
      errorSection: '',
      showError: false,
      textBox: ''
    };

    let collection = game.collections.get("Actor");

    this.data.folders = collection?._formatFolderSelectOptions()
      .reduce((acc, folder) => {
        acc[folder.id] = folder.name;
        return acc;
      }, {}) ?? {};
    this.data.folders[''] = "ExEss.None";
  }

  static DEFAULT_OPTIONS = {
    tag: "form",
    form: {
      handler: TemplateImporter.myFormHandler,
      submitOnClose: false,
      submitOnChange: true,
      closeOnSubmit: false
    },
    classes: [`leaves-background`],
    position: { width: 860, height: 1047 },
  };

  async close(options = {}) {
    const applyChanges = await foundry.applications.api.DialogV2.confirm({
      window: { title: `${game.i18n.localize("ExEss.Close")}?` },
      content: "<p>Any unsaved changed will be lost</p>",
      classes: [`${game.settings.get("exaltedessence", "sheetStyle")}-background`],
      modal: true
    });
    if (applyChanges) {
      super.close();
    }
  }

  static async myFormHandler(event, form, formData) {
    // Do things with the returned FormData
    const formObject = foundry.utils.expandObject(formData.object);
    if (formObject.type) {
      let collection = game.collections.get("Actor");
      this.data.folders = collection?._formatFolderSelectOptions()
        .reduce((acc, folder) => {
          acc[folder.id] = folder.name;
          return acc;
        }, {}) ?? {};
      this.data.folders[''] = "ExEss.None";
      // this.data.type = formObject.type;
    }
    for (let key in formObject) {
      if (formObject.hasOwnProperty(key) && this.data.hasOwnProperty(key)) {
        this.data[key] = formObject[key];
      }
    }

    if (event.type === 'submit') {
      this.data.showError = false;
      await this.createCharacter();
      if (!this.data.showError) {
        ui.notifications.notify(`Import Complete`);
      }
    }

    this.render();
  }

  static PARTS = {
    form: {
      template: "systems/exaltedessence/templates/dialogues/template-importer.html",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  async _prepareContext(_options) {
    this.data.selects = CONFIG.EXALTEDESSENCE.selects;
    this.data.templateHint = game.i18n.localize(`ExEss.ImporterHint`);
    this.data.buttons = [
      { type: "submit", icon: "fa-solid fa-save", label: "ExEss.Import" }
    ]
    return this.data;
  }

  async _getFolder() {
    let folderId = this.data.folder;
    let folder = null;

    if (folderId) {
      folder = game.folders.get(folderId);
    }
    return folder;
  }

  async createCharacter() {
    let actorData = this._getStatBlock(false);
    let folder = await this._getFolder();
    const itemData = [
    ];
    let currentPool = null;
    this.errorSection = 'Initial Info';

    const lines = this.data.textBox.split(/\r?\n/);
    let isItemSection = false;
    let currentItem = null;
    let genericQualities = "";

    actorData.items = [];
    lines.forEach(line => {
      if (line.match(/ATTACKS AND QUALITIES/)) {
        isItemSection = true;
        return;
      }

      if (!isItemSection) {
        const primaryMatch = line.match(/Primary Pool \((\d+)\): (.+)/);
        const secondaryMatch = line.match(/Secondary Pool \((\d+)\): (.+)/);
        const tertiaryMatch = line.match(/Tertiary Pool \((\d+)\)/);
        const statMatch = line.match(/(Resolve|Health Levels|Essence|Defense|Hardness|Soak): (\d+)/);

        if (primaryMatch) {
          currentPool = 'primary';
          actorData.system.primary = { value: parseInt(primaryMatch[1], 10), actions: primaryMatch[2] };
        } else if (secondaryMatch) {
          currentPool = 'secondary';
          actorData.system.secondary = { value: parseInt(secondaryMatch[1], 10), actions: secondaryMatch[2] };
        } else if (tertiaryMatch) {
          currentPool = null;
          actorData.system.tertiary = { value: parseInt(tertiaryMatch[1], 10) };
        } else if (statMatch) {
          currentPool = null;
          const stat = statMatch[1].toLowerCase().replace(' ', '_');
          actorData.system[stat] = parseInt(statMatch[2], 10);
        } else if (currentPool && line.trim()) {
          actorData.system[currentPool].actions += ` ${line}`;
        }
      } else {
        if (line.trim() === "") {
          if (genericQualities) {
            genericQualities.split(', ').forEach(quality => {
              actorData.items.push({ name: quality.trim(), system: { description: '' } });
            });
            genericQualities = "";
          }
          return;
        }

        const itemMatch = line.match(
          /^(?!Tags:|following spells)([^:]+):\s*(.*)|^(.+?)\s*\(p\.\s*(\d+|XX)\)/i
        );
        if (itemMatch) {
          if (currentItem) actorData.items.push(currentItem);
          currentItem = { name: itemMatch[1].trim(), type: 'quality', system: { description: itemMatch[2].trim() } };
        } else if (currentItem) {
          currentItem.system.description += ' ' + line.trim();
        } else {
          genericQualities += (genericQualities ? ' ' : '') + line.trim();
        }
      }
    });
    if (currentItem) actorData.items.push(currentItem);
    if (genericQualities) {
      genericQualities.split(', ').forEach(quality => {
        actorData.items.push({ name: quality.trim(), system: { description: '' } });
      });
    }
    const moteCostRegex = /Spend\s+(\d+)\s+motes?/;
    const moteCommitRegex = /Commit\s+(\d+)\s+motes?/;
    const weaponStatRegex = /([+-]?\d+)\s*(Accuracy|Defense|Damage|Overwhelming)|\b(Accuracy|Defense|Damage|Overwhelming)\s*([+-]?\d+)/g;
    actorData.items.forEach(item => {
      const description = item.system?.description;

      if (description) {
        const spendMatch = description.match(moteCostRegex);

        if (spendMatch) {
          const motes = parseInt(spendMatch[1], 10);
          item.system.cost = item.system.cost || {};  // Ensure `.cost` exists
          item.system.cost.motes = motes;
        }
        const commitMatch = description.match(moteCommitRegex);
        if (commitMatch) {
          const committed = parseInt(commitMatch[1], 10);
          item.system.cost = item.system.cost || {};
          item.system.cost.committed = committed;
        }

        let weaponMatch;
        while ((weaponMatch = weaponStatRegex.exec(description)) !== null) {
          const value = parseInt(weaponMatch[1] || weaponMatch[4], 10);  // Capture the correct value
          const label = (weaponMatch[2] || weaponMatch[3]).toLowerCase(); // Capture the correct label

          currentItem.system[label] = value;
          currentItem.type = 'weapon';
        }
      }
    });
    if (folder) {
      actorData.folder = folder;
    }
    console.log(actorData.system);
    console.log(actorData.items);
    // await Actor.create(actorData);
  }

  _getItemData(textArray, index, actorData) {
    this.errorSection = 'Items';
    let itemData = [];
    if (textArray[index] === '') {
      index++;
    }
    return itemData;
  }

  _getStatBlock(adversary = false) {
    return new Actor.implementation({
      name: 'New Character',
      type: 'npc'
    }).toObject();
  }
}