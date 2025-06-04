const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class TemplateImporter extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(type) {
    super(type);

    this.data = {
      type: type,
      test: '',
      folder: '',
      charmType: 'other',
      folders: [],
      errorText: '',
      errorSection: '',
      showError: false,
      textBox: ''
    };

    let collection;
    if (this.data.type === 'qc') {
      collection = game.collections.get("Actor");
    }
    else {
      collection = game.collections.get("Item");
    }

    this.data.folders = collection?._formatFolderSelectOptions()
      .reduce((acc, folder) => {
        acc[folder.id] = folder.name;
        return acc;
      }, {}) ?? {};
    this.data.folders[''] = "ExEss.None";
  }

  static DEFAULT_OPTIONS = {
    window: { resizable: true },
    tag: "form",
    form: {
      handler: TemplateImporter.myFormHandler,
      submitOnClose: false,
      submitOnChange: true,
      closeOnSubmit: false
    },
    classes: [`leaves-background`, 'exaltedessence'],
    position: { width: 860, height: 1047 },
  };

  async close(options = {}) {
    const applyChanges = await foundry.applications.api.DialogV2.confirm({
      window: { title: `${game.i18n.localize("ExEss.Close")}?`, resizable: true },
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
      let collection;
      if (formObject.type === 'qc') {
        collection = game.collections.get("Actor");
      }
      else {
        collection = game.collections.get("Item");
      }
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
      // await this.createCharacter();
      await this.importTemplate(event);

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
    const hintMap = { 'charm': 'CharmImportHint', 'spell': 'SpellImportHint', 'qc': 'QCImportHint' }
    this.data.templateHint = game.i18n.localize(`ExEss.${hintMap[this.data.type]}`);
    this.data.buttons = [
      { type: "submit", icon: "fa-solid fa-save", label: "ExEss.Import", cssClass: "full-footer-button" }
    ]
    return this.data;
  }

  async importTemplate(event) {
    if (!this.data.textBox) {
      ui.notifications.notify(`No Text Found`);
      return;
    }
    switch (this.data.type) {
      case 'charm':
        await this.createCharms();
        break;
      case 'qc':
        await this.createQuickCharacter();
        break;
    }
  }

  async _getFolder() {
    let folderId = this.data.folder;
    let folder = null;

    if (folderId) {
      folder = game.folders.get(folderId);
    }
    return folder;
  }

  async createCharms() {
    let folder = await this._getFolder();
    const charmsList = [];


    let charmBlocks = this._getCharmBlocks(this.data.textBox); // Assuming this method splits the text into charm sections

    for (let charmText of charmBlocks) {
      let lines = charmText.split('\n').map(line => line.trim()).filter(line => line);
        
      // Combine name if the second line is also all caps
      let charmName = lines[0];
      if (lines[1] && lines[1] === lines[1].toUpperCase()) {
          charmName += " " + lines[1];
          lines.splice(1, 1); // Remove the second line since it's now part of the name
      }
      
      charmName = this._formatTitleCase(charmName);
      let prerequisitesLine = lines.find(line => line.startsWith("Prerequisites:") || line.startsWith("Prerequisite:"));
      const charmAbilities = Object.keys(CONFIG.EXALTEDESSENCE.selects.charmAbilities);

      let charmData = new Item.implementation({
        name: charmName,
        type: 'charm',
        folder: folder ?? undefined,
      }).toObject();

      charmData.system.description = lines.slice(1).join(" \n");
      charmData.system.charmtype = this.data.charmType;
      charmData.system.essence = 1;

      if (prerequisitesLine) {
        let prereqs = prerequisitesLine.replace(/Prerequisites?:/, "").split(",").map(p => p.trim());

        for (let prereq of prereqs) {
          let essenceMatch = prereq.match(/Essence (\d+)/i);
          let abilityMatch = prereq.match(/(\w+) (\d+)/i);

          if (essenceMatch) {
            charmData.system.essence = parseInt(essenceMatch[1]);
          } else if (abilityMatch) {
            let abilityName = abilityMatch[1].toLowerCase();
            let abilityValue = parseInt(abilityMatch[2]);

            if (charmAbilities.includes(abilityName)) {
              charmData.system.ability = abilityName;
              charmData.system.requirement = abilityValue;
            } else {
              charmData.system.prerequisites += (charmData.system.prerequisites ? ", " : "") + prereq;
            }
          } else {
            charmData.system.prerequisites += (charmData.system.prerequisites ? ", " : "") + prereq;
          }
        }
      }
      let moteCostMatch = charmText.match(/Spend (\d+) motes?/i);
      if (moteCostMatch) {
        charmData.system.cost.motes = parseInt(moteCostMatch[1]);
      }
      let committedCostMatch = charmText.match(/Commit (\d+) mote/i);
      if (committedCostMatch) {
        charmData.system.cost.committed = parseInt(committedCostMatch[1]);
      }
      charmsList.push(await Item.create(charmData));
    }

    if (charmsList) {
      this.updatePrereqs(charmsList);
    }
  }

  _formatTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  _getCharmBlocks(text) {
    let blocks = [];
    let currentBlock = [];
    let lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      let previousLine = (lines[i - 1] ?? "first line").trim();

      if (line && line === line.toUpperCase() && (!previousLine || previousLine !== previousLine.toUpperCase())) {
        if (currentBlock.length) {
          blocks.push(currentBlock.join('\n'));
          currentBlock = [];
        }
      }

      currentBlock.push(line);
    }

    if (currentBlock.length) {
      blocks.push(currentBlock.join('\n'));
    }

    return blocks;
  }

  async updatePrereqs(charmsList) {
    const filteredCharms = charmsList.filter(charm => charm.system.prerequisites && charm.system.prerequisites !== 'None');
    for (const charm of filteredCharms) {
      const charmData = foundry.utils.duplicate(charm);
      const splitPrereqs = charm.system.prerequisites.split(',');
      const newPrereqs = [];
      for (const prereq of splitPrereqs) {
        const existingCharm = game.items.filter(item => item.type === 'charm' && item.system.charmtype === charm.system.charmtype && item.name.trim() === prereq.trim())[0];
        if (existingCharm) {
          charmData.system.charmprerequisites.push(
            {
              id: existingCharm.id,
              name: existingCharm.name
            }
          );
        }
        else {
          newPrereqs.push(prereq);
        }
      }
      if (charm.system.charmprerequisites) {
        charmData.system.prerequisites = newPrereqs.join(", ");
        await charm.update(charmData);
      }
    }
  }

  async createQuickCharacter() {
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
    actorData.name = lines[0];
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
          actorData.system.pools.primary = { value: parseInt(primaryMatch[1], 10), actions: primaryMatch[2] };
        } else if (secondaryMatch) {
          currentPool = 'secondary';
          actorData.system.pools.secondary = { value: parseInt(secondaryMatch[1], 10), actions: secondaryMatch[2] };
        } else if (tertiaryMatch) {
          currentPool = null;
          actorData.system.pools.tertiary = { value: parseInt(tertiaryMatch[1], 10), actions: "" };
        } else if (statMatch) {
          currentPool = null;
          const stat = statMatch[1].toLowerCase().replace(' ', '_');
          if(stat === 'health_levels') {
            actorData.system.health.levels = parseInt(statMatch[2], 10);
          } else {
            actorData.system[stat].value = parseInt(statMatch[2], 10);
          }
        } else if (currentPool && line.trim()) {
          actorData.system[currentPool].actions += ` ${line}`;
        } else {
          actorData.system.biography += ` ${line}`;
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
        const existingQuality = game.items.find(item => item.name.trim().toLowerCase() === quality.trim().toLowerCase() && item.type === 'quality');
        if(existingQuality) {
          actorData.items.push(foundry.utils.duplicate(existingQuality));
        } else {
          actorData.items.push({ name: quality.trim(), type: 'quality', system: { description: '' } });
        }
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

          item.system[label] = value;
          item.type = 'weapon';
        }
      }
    });
    if (folder) {
      actorData.folder = folder;
    }
    console.log(actorData.system);
    console.log(actorData.items);
    await Actor.create(actorData);
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