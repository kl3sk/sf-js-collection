export default class Index {
    constructor(container, options = {}) {
        this.container = (typeof container == 'string') ? document.querySelector(container) : container
        this.defaultOptions(options)

        if (this.container.dataset.prototypeLabelName) {
            this.prototypeLabelName = this.container.dataset.prototypeLabelName
        } else if (options.prototypeLabelName) {
            this.prototypeLabelName = options.prototypeLabelName
        } else {
            this.prototypeLabelName = '__name__label__'
        }

        if (this.container.dataset.prototypeName) {
            this.prototypeName = this.container.dataset.prototypeName
        } else if (options.prototypeName) {
            this.prototypeName = options.prototypeName
        } else {
            this.prototypeName = '__name__'
        }

        this.entryIndex = this.container.children.length
        this.container.dataset.entryIndex = this.entryIndex

        // binds
        this.addAction = this.addAction.bind(this)
        this.addEntry = this.addEntry.bind(this)

        // finally init class
        this.init()
    }

    defaultOptions(options) {
        this.options = {
            allowAdd: this.container.dataset.allowAdd || options.allowAdd,
            allowDelete: this.container.dataset.allowDelete || options.allowDelete,
            addButtonAttr: this.container.dataset.addButtonAttr || options.addButtonAttr || {},
            removeButtonAttr: this.container.dataset.removeButtonAttr || options.removeButtonAttr || {},
        }

        return this.options
    }

    init() {
        this.previousEntries()
        this.collectionAddActionButton = document.querySelectorAll('.collection-add-action')

        if (this.options.allowAdd) {
            // if allow add and no button declared with class .collection-add-action, create one at the bottom of the collection
            if (!this.collectionAddActionButton.length) {
                const addButton = this._createAddButton()
                this.container.parentElement.insertAdjacentElement('beforeend', addButton)
                this.collectionAddActionButton = [addButton]
            }
            this.addAction()
        } else {
            if (this.collectionAddActionButton.length) {
                this.collectionAddActionButton.forEach(el => {
                    el.remove()
                })
            }
        }

        if (this.options.allowDelete) {
            this.removeAction()
        }

    }

    /**
     * Add attributes to an elemet
     *
     * @param element
     * @param attrs
     */
    attributes(element, attrs) {
        for (const attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                const attributeName = attr
                const attributeValue = attrs[attr]

                if (attributeName === 'class') {
                    const classes = attributeValue.split(' ')
                    element.classList.add(...classes)
                } else if(attributeName === 'text') {
                    element.innerText = attributeValue
                } else if(attributeName === 'html') {
                    element.innerHTML = attributeValue
                } else {
                    element[attributeName] = attributeValue
                }
            }
        }
    }

    /**
     * Create a "add" button if none found with class .collection-add-action in template
     *
     * @returns {HTMLButtonElement}
     * @private
     */
    _createAddButton() {
        const addButton = document.createElement('button')
        addButton.innerText = 'Add (js)'
        addButton.classList.add('.collection-add-action')
        this.attributes(addButton, this.options.addButtonAttr)

        return addButton
    }

    prototypeEntry() {
        const entryPrototype = this.container.dataset.prototype
        const label = this.prototypeLabelName
        const name = this.prototypeName

        const labelRegExp = new RegExp(label, 'g')
        const nameRegExp = new RegExp(name, 'g')

        const prototype = entryPrototype
            .replace(labelRegExp, `!New! ${this.entryIndex}`)
            .replace(nameRegExp, this.entryIndex) + ''

        this.entryIndex++
        this.container.dataset.entryIndex = this.entryIndex

        return prototype
    }

    previousEntries() {
        if (this.options.allowDelete) {
            this.container.children.forEach(child => {
                child.insertAdjacentElement('beforeend', this.removeEntry())
            })
        }
    }

    removeEntry() {
        const btn = document.createElement('button')
        if (!this.options.removeButtonAttr.type) {
            btn.type = 'button'
        }
        if (!this.options.removeButtonAttr.text || !this.options.removeButtonAttr.html) {
            btn.innerHTML = 'Remove'
        }

        btn.classList.add('collection-remove-action')

        this.attributes(btn, this.options.removeButtonAttr)


        return btn
    }

    addEntry(e) {
        e.preventDefault()
        const html = this.prototypeEntry()
        this.container.insertAdjacentHTML('beforeend', html)
        this.container.lastElementChild.insertAdjacentElement('beforeend', this.removeEntry())
    }

    addAction() {
        this.collectionAddActionButton.forEach(button => {
            button.addEventListener('click', this.addEntry)
        })
    }

    removeAction() {
        this.container.addEventListener('click', e => {
            const target = e.target

            if (target.classList.contains('collection-remove-action')) {
                target.parentElement.remove()
            }
        })
    }
}