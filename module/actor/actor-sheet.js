/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ExaltedessenceActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["exaltedessence", "sheet", "actor"],
      template: "systems/exaltedessence/templates/actor/actor-sheet.html",
      width: 800,
      height: 800,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    for (let attr of Object.values(data.data.attributes)) {
      attr.isCheckbox = attr.dtype === "Boolean";
    }

    // Prepare items.
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
    }

    return data;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const advantages = [];
    const charms = [];

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to advantages.
      else if (i.type === 'advantage') {
        advantages.push(i);
      }
      // Append to spells.
      else if (i.type === 'charm') {
        if (i.type === 'charm') {
          charm.push(i);
        }
      }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.advantages = advantages;
    actorData.charms = charms;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    this._setupDotCounters(html)
    this._setupSquareCounters(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.resource-value > .resource-value-step').click(this._onDotCounterChange.bind(this))
    html.find('.resource-value > .resource-value-empty').click(this._onDotCounterEmpty.bind(this))
    html.find('.resource-counter > .resource-counter-step').click(this._onSquareCounterChange.bind(this))

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  _onSquareCounterChange (event) {
    event.preventDefault()
    const element = event.currentTarget
    const index = Number(element.dataset.index)
    const oldState = element.dataset.state || ''
    const parent = $(element.parentNode)
    const data = parent[0].dataset
    const states = parseCounterStates(data.states)
    const fields = data.name.split('.')
    const steps = parent.find('.resource-counter-step')
    const fulls = Number(data[states['-']]) || 0
    const halfs = Number(data[states['/']]) || 0

    if (index < 0 || index > steps.length) {
      return
    }

    const allStates = ['', ...Object.keys(states)]
    const currentState = allStates.indexOf(oldState)
    if (currentState < 0) {
      return
    }

    const newState = allStates[(currentState + 1) % allStates.length]
    steps[index].dataset.state = newState

    if ((oldState !== '' && oldState !== '-') || (oldState !== '')) {
      data[states[oldState]] = Number(data[states[oldState]]) - 1
    }

    // If the step was removed we also need to subtract from the maximum.
    if (oldState !== '' && newState === '') {
      data[states['-']] = Number(data[states['-']]) - 1
    }

    if (newState !== '') {
      data[states[newState]] = Number(data[states[newState]]) + Math.max(index + 1 - fulls - halfs, 1)
    }

    const newValue = Object.values(states).reduce(function (obj, k) {
      obj[k] = Number(data[k]) || 0
      return obj
    }, {})

    this._assignToActorField(fields, newValue)
  }

  _onDotCounterChange (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const index = Number(dataset.index)
    const parent = $(element.parentNode)
    const fieldStrings = parent[0].dataset.name
    const fields = fieldStrings.split('.')
    const steps = parent.find('.resource-value-step')
    if (index < 0 || index > steps.length) {
      return
    }

    steps.removeClass('active')
    steps.each(function (i) {
      if (i <= index) {
        $(this).addClass('active')
      }
    })
    this._assignToActorField(fields, index + 1)
  }

  _assignToActorField (fields, value) {
    const actorData = duplicate(this.actor)
    // update actor owned items
    if (fields.length === 2 && fields[0] === 'items') {
      for (const i of actorData.items) {
        if (fields[1] === i._id) {
          i.data.points = value
          break
        }
      }
    } else {
      const lastField = fields.pop()
      fields.reduce((data, field) => data[field], actorData)[lastField] = value
    }
    this.actor.update(actorData)
  }

  _onDotCounterEmpty (event) {
    event.preventDefault()
    const element = event.currentTarget
    const parent = $(element.parentNode)
    const fieldStrings = parent[0].dataset.name
    const fields = fieldStrings.split('.')
    const steps = parent.find('.resource-value-empty')

    steps.removeClass('active')
    this._assignToActorField(fields, 0)
  }

  _setupDotCounters (html) {
    html.find('.resource-value').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-value-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
        }
      })
    })
    html.find('.resource-value-static').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-value-static-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
        }
      })
    })
  }

  _setupSquareCounters (html) {
    html.find('.resource-counter').each(function () {
      const data = this.dataset
      const states = parseCounterStates(data.states)

      const fulls = Number(data[states['-']]) || 0
      const halfs = Number(data[states['/']]) || 0

      const values = new Array(fulls + halfs) 

      values.fill('/', 0, halfs)

      $(this).find('.resource-counter-step').each(function () {
        this.dataset.state = ''
        if (this.dataset.index < values.length) {
          this.dataset.state = values[this.dataset.index]
        }
      })
    })
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }
}

function parseCounterStates (states) {
  return states.split(',').reduce((obj, state) => {
    const [k, v] = state.split(':')
    obj[k] = v
    return obj
  }, {})
}
