/**
* --------------------------------------------------------------------------
* Licensed under MIT (https://github.com/quark-dev/Phonon-Framework/blob/master/LICENSE)
* --------------------------------------------------------------------------
*/
import Event from '../../core/events'
import Component from '../component'

const Notification = (() => {
  /**
   * ------------------------------------------------------------------------
  * Constants
  * ------------------------------------------------------------------------
  */

  const NAME = 'notification'
  const VERSION = '2.0.0'
  const DEFAULT_PROPERTIES = {
    element: null,
    message: '',
    showButton: true,
    timeout: null,
    background: 'primary',
  }

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Notification extends Component {

    constructor(options = {}) {
      super(NAME, VERSION, DEFAULT_PROPERTIES, options, true)

      this.template = '' +
        '<div class="notification-inner">' +
          '<div class="message"></div>' +
          '<button type="button" class="close" data-dismiss="off-canvas" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
          '</button>' +
        '</div>'

      if (this.dynamicElement) {
        this.build()
      }

      this.timeoutCallback = null
    }

    build() {
      const div = document.createElement('div')
      div.classList.add('notification')

      div.innerHTML = this.template

      // text message
      div.querySelector('.message').innerHTML = this.options.message

      if (!this.options.showButton) {
        div.querySelector('button').style.display = 'none'
      }

      this.options.element = div

      document.body.appendChild(this.options.element)
    }

    show() {
      if (this.options.element === null) {
        // build and insert a new DOM element
        this.build()
      }

      if (this.options.element.classList.contains('show')) {
        console.error(`${NAME}. The notification is already visible.`)
        return false
      }

      // reset color
      if (this.options.background) {
        this.options.element.removeAttribute('class')
        this.options.element.setAttribute('class', 'notification')

        this.options.element.classList.add(`bg-${this.options.background}`)
        this.options.element.querySelector('button').classList.add(`btn-${this.options.background}`)
      }

      if (this.options.showButton) {
        // attach the button handler
        const buttonElement = this.options.element.querySelector('button')
        this.registerElement({ target: buttonElement, event: 'click' })
      }

      setTimeout(() => {
        this.options.element.classList.add('show')
        this.triggerEvent(Event.SHOW)

        const onShown = () => {
          this.triggerEvent(Event.SHOWN)
          this.options.element.removeEventListener(Event.TRANSITION_END, onShown)
        }

        this.options.element.addEventListener(Event.TRANSITION_END, onShown)

      }, 1)

      if (Number.isInteger(this.options.timeout) && this.options.timeout > 0) {
        // if there is a timeout, auto hide the notification
        this.timeoutCallback = setTimeout(() => {
          this.hide()
        }, this.options.timeout + 1)
      }

      return true
    }

    hide() {
      /*
       * prevent to close a notification with a timeout
       * if the user has already clicked on the button
       */
      if (this.timeoutCallback) {
        clearTimeout(this.timeoutCallback)
        this.timeoutCallback = null
      }

      if (!this.options.element.classList.contains('show')) {
        console.error(`${NAME}. The notification is not visible.`)
        return false
      }

      this.triggerEvent(Event.HIDE)

      if (this.options.showButton) {
        const buttonElement = this.options.element.querySelector('button')
        this.unregisterElement({ target: buttonElement, event: 'click' })
      }

      this.options.element.classList.remove('show')
      this.options.element.classList.add('hide')

      const onHidden = () => {
        this.options.element.removeEventListener(Event.TRANSITION_END, onHidden)
        this.options.element.classList.remove('hide')

        this.triggerEvent(Event.HIDDEN)

        if (this.dynamicElement) {
          document.body.removeChild(this.options.element)
          this.options.element = null
        }
      }

      this.options.element.addEventListener(Event.TRANSITION_END, onHidden)

      return true
    }

    onElementEvent() {
      this.hide()
    }

    static _DOMInterface(options) {
      return super._DOMInterface(Notification, options)
    }
  }

  return Notification
})()

export default Notification