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
    let currentPool = null;
    this.errorSection = 'Initial Info';

    const lines = this.data.textBox.split(/\r?\n/);
    let isItemSection = false;

    actorData.items = [];
    actorData.name = lines[0];
    for (const line of lines) {
      if (line.match(/ATTACKS AND QUALITIES/i)) {
        break;
      }

      if (!isItemSection) {
        const primaryMatch = line.match(/Primary Pool \((\d+)\): (.+)/);
        const secondaryMatch = line.match(/Secondary Pool \((\d+)\): (.+)/);
        const tertiaryMatch = line.match(/Tertiary Pool \((\d+)\)/);
        const virtueMatch = line.includes('Virtues');
        const statMatch = line.match(/(Resolve|Health Levels|Essence|Defense|Hardness|Motes|Soak): (\d+)/);

        if (primaryMatch) {
          currentPool = 'primary';
          actorData.system.pools.primary = { value: parseInt(primaryMatch[1], 10), actions: primaryMatch[2] };
        } else if (secondaryMatch) {
          currentPool = 'secondary';
          actorData.system.pools.secondary = { value: parseInt(secondaryMatch[1], 10), actions: secondaryMatch[2] };
        } else if (tertiaryMatch) {
          currentPool = null;
          actorData.system.pools.tertiary = { value: parseInt(tertiaryMatch[1], 10), actions: "" };
        } else if (virtueMatch) {
          const virtueSplit = line.replace("Virtues:", "").split(',');
          actorData.system.details.majorvirtue = virtueSplit[0];
          if (virtueSplit[1]) {
            actorData.system.details.minorvirtue = virtueSplit[1];
          }
        } else if (statMatch) {
          currentPool = null;
          const stat = statMatch[1].toLowerCase().replace(' ', '_');
          if (stat === 'health_levels') {
            actorData.system.health.levels = parseInt(statMatch[2], 10);
          } else {
            actorData.system[stat].value = parseInt(statMatch[2], 10);
            if (stat === 'hardness') {
              actorData.system.poise.max = parseInt(statMatch[2], 10);
              actorData.system.poise.value = parseInt(statMatch[2], 10);
            }
          }
        } else if (currentPool && line.trim()) {
          actorData.system.pools[currentPool].actions += ` ${line}`;
        } else {
          actorData.system.biography += ` ${line}`;
        }
      }
    }
    const { items, qualities, tacticsText } = this._parseAttacksAndQualities(this.data.textBox);
    // console.log("Items:", items);
    // console.log("Qualities:", qualities);
    actorData.system.biography += `\n${tacticsText}`;
    actorData.items = items;
    const moteCostRegex = /Spend\s+(\d+)\s+motes?/;
    const moteCommitRegex = /Commit\s+(\d+)\s+motes?/;
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
      }
    });
    for (const qualityName of qualities) {
      const quality = game.items.find(item => item.name.trim().toLowerCase() === qualityName.replace(/\s*\([^)]*\)\s*/g, "").trim().toLowerCase() && item.type === 'quality');
      if (quality) {
        actorData.items.push(foundry.utils.duplicate(quality));
      } else {
        actorData.items.push({ name: qualityName.trim(), img: CONFIG.EXALTEDESSENCE.itemIcons['quality'], type: 'quality', system: { description: '' } });
      }
    }
    if (folder) {
      actorData.folder = folder;
    }
    console.log(actorData.system);
    console.log(actorData.items);
    await Actor.create(actorData);
  }

  _parseAttacksAndQualities(text) {
    const startIndex = text.search(/Attacks and Qualities/i);

    if (startIndex === -1) {
      return { qualities: [], items: [] };
    }

    text = text.slice(startIndex);

    // Remove header
    text = text.replace(/^Attacks and Qualities\s*/i, "").trim();

    // Normalize line breaks and wrapped lines
    text = text.replace(/\r/g, "");

    // Find the first unique item (first "Name:")
    const firstItemMatch = text.match(/^(.+?):/m);
    if (!firstItemMatch) return { qualities: [], items: [] };

    const firstItemIndex = firstItemMatch.index;

    // Everything before the first item is generic qualities
    const qualitiesText = text.slice(0, firstItemIndex).replace(/\n/g, " ").trim();

    // Split qualities on commas that are not inside parentheses
    const qualities = [];
    let depth = 0;
    let start = 0;

    for (let i = 0; i < qualitiesText.length; i++) {
      const char = qualitiesText[i];

      if (char === "(") depth++;
      else if (char === ")") depth--;

      if (char === "," && depth === 0) {
        qualities.push(qualitiesText.slice(start, i).trim());
        start = i + 1;
      }
    }

    qualities.push(qualitiesText.slice(start).trim());

    const itemsText = text.slice(firstItemIndex).trim();
    let itemSection = itemsText;

    const weaponsMatch = itemsText.match(/\bWeapons:/i);

    let weaponsText = "";
    let tacticsText = "";

    if (weaponsMatch) {
      itemSection = itemsText.slice(0, weaponsMatch.index).trim();
      weaponsText = itemsText.slice(weaponsMatch.index).trim();
      weaponsText = weaponsText.replace(/^Weapons:\s*/i, "").trim();
    }
    const tacticsMatch = weaponsText.match(/Tactics and Advice/i);
    let weaponsSection = weaponsText;

    if (tacticsMatch) {
      weaponsSection = weaponsText.slice(0, tacticsMatch.index).trim();
      tacticsText = weaponsText.slice(tacticsMatch.index).trim();
    }

    // Parse unique items
    let items = [];

    const itemRegex =
      /^([^:\n]+):\s*([\s\S]*?)(?=^[^:\n]+:\s*|\s*$)/gm;

    let match;

    let itemName = '';
    let itemDescription = '';

    for (const line of itemSection.split(/\r?\n/)) {
      if ((match = itemRegex.exec(line)) !== null) {
        if (itemName) {
          items.push({
            name: itemName,
            type: 'quality',
            img: CONFIG.EXALTEDESSENCE.itemIcons['quality'],
            system: {
              description: itemDescription,
            }
          });
        }
        itemName = match[1].trim();
        itemDescription = match[2]
          .replace(/\n+/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      } else {
        itemDescription += line;
      }
    };
    if (itemName) {
      items.push({
        name: itemName,
        type: 'quality',
        img: CONFIG.EXALTEDESSENCE.itemIcons['quality'],
        system: {
          description: itemDescription,
        }
      });
    }

    const weapons = this._parseWeapons(weaponsSection);
    console.log(weapons);
    // while ((match = itemRegex.exec(text)) !== null) {
    //   items.push({
    //     name: match[1].trim(),
    //     description: match[2]
    //       .replace(/\n+/g, " ")
    //       .replace(/\s+/g, " ")
    //       .trim()
    //   });
    // }
    items = [...items, ...weapons];
    console.log(items);
    return {
      qualities,
      items,
      tacticsText,
    };
  }

  _parseWeapons(text) {
    // Remove header and normalize whitespace
    text = text
      .replace(/^Weapons:\s*/i, "")
      .trim();

    let weaponStrings = [];

    let index = 0;
    let textLines = text.split(/\r?\n/);

    while (index < textLines.length) {
      if (!textLines[index + 1] || !textLines[index + 1].includes(')')) {
        weaponStrings.push(textLines[index]);
        index++;
      } else {
        weaponStrings.push(textLines[index] + textLines[index + 1]);
        index += 2;
      }
    }
    const weapons = [];

    const weaponTags = [
      "aggravated",
      "artifact",
      "balanced",
      "chopping",
      "concealable",
      "defensive",
      "disarming",
      "flame",
      "flexible",
      "improvised",
      "magicdamage",
      "melee",
      "mounted",
      "natural",
      "worn",
      "offhand",
      "onehanded",
      "paired",
      "piercing",
      "pulling",
      "powerful",
      "ranged",
      "reaching",
      "returning",
      "shield",
      "smashing",
      "thrown",
      "twohanded"
    ];
    for (const weapon of weaponStrings) {
      let newWeapon = {
        name: '',
        type: 'weapon',
        img: CONFIG.EXALTEDESSENCE.itemIcons['weapon'],
        system: {
          accuracy: 0,
          damage: 0,
          defense: 0,
          overwhelming: 0,
          traits: {
            weapontags: {
              value: [],
              custom: ""
            }
          }
        }
      };
      let weaponSplit = weapon.split('(');
      newWeapon.name = weaponSplit[0];
      if (weaponSplit[1]) {
        const statArray = weaponSplit[1].replace(/[()]/g, "").replace(/Tags:/gi, "").split(',');
        for (const stat of statArray) {
          const cleanedStat = stat.toLowerCase().trim();
          if (cleanedStat.includes('accuracy')) {
            newWeapon.system.accuracy = parseInt(stat.replace(/\D/g, ""));
          }
          if (cleanedStat.includes('damage')) {
            newWeapon.system.damage = parseInt(stat.replace(/\D/g, ""));
          }
          if (cleanedStat.includes('overwhelming')) {
            newWeapon.system.overwhelming = parseInt(stat.replace(/\D/g, ""));
          }
          if (cleanedStat.includes('defense')) {
            newWeapon.system.defense = parseInt(stat.replace(/\D/g, ""));
          }
          if (weaponTags.includes(cleanedStat)) {
            newWeapon.system.traits.weapontags.value.push(cleanedStat);
          }
        }
      }
      weapons.push(newWeapon);
    }

    return weapons;
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