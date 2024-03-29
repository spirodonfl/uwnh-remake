let globalSheets = null;

export function getGlobalStyleSheets() {
    if (globalSheets === null) {
        globalSheets = Array.from(document.styleSheets)
            .map(x => {
                const sheet = new CSSStyleSheet();
                const css = Array.from(x.cssRules).map(rule => rule.cssText).join(' ');
                sheet.replaceSync(css);
                return sheet;
            });
    }

    return globalSheets;
}

export function addGlobalStylesToShadowRoot(shadowRoot) {
    shadowRoot.adoptedStyleSheets.push(
        ...getGlobalStyleSheets()
    );
}

export const globalStyles = `
    <style>
/* some animations nicked from
 * https://github.com/animate-css/animate.css
 */

.twa-5x {
  margin: unset;
}

/*** bounce ***/

.juicy__bounce {
  animation-duration: 1s;
  animation-delay: 0s;
  animation-repeat: 1;
  animation-name: bounce;
  transform-origin: center bottom;
}
.juicy__bounce__shadow {
  animation-duration: 1s;
  animation-delay: 0s;
  animation-repeat: 1;
  animation-name: bounce-shadow;
  transform-origin: center center;
}

@keyframes bounce {
  from,
  53%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateY(0px);
  }

  30%,
  43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translateY(-30px) scaleY(1.1);
  }

  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translateY(-15px) scaleY(1.05);
  }

  80% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateY(0px) scaleY(0.95);
  }

  90% {
    transform: translateY(-4px) scaleY(1.02);
  }
}

@keyframes bounce-shadow {
  from,
  53%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: scale(1);
  }

  30%,
  43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: scale(0.5);
  }

  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: scale(0.7);
  }

  80% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: scaleY(0.8);
  }

  90% {
    transform: scaleY(0.9);
  }
}

/*** coin up ***/

.juicy__coinup {
  animation: coinup 1.5s forwards;
  transform-origin: center bottom;
}

@keyframes coinup {
  from,
  40%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }

  20%,
  23% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -200px, 0) scaleY(1.1);
  }

  55% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -100px, 0) scaleY(1.05);
  }

  70% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0) scaleY(0.95);
  }

  85% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -50px, 0) scaleY(1.02);
  }
  
  100% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, 0, 0);
  }
}

/*** shake ***/

/* https://www.w3schools.com/howto/howto_css_shake_image.asp */
.juicy__shake__1 {
  animation: shake 0.5s;
  animation-iteration-count: infinite;
}

.juicy__shake__2 {
  animation: shake-2 0.4s;
  animation-iteration-count: infinite;
}

.juicy__shake__3 {
  animation: shake-3 0.3s;
  animation-iteration-count: infinite;
}

.juicy__shake__4 {
  animation: shake-4 0.2s;
  animation-iteration-count: infinite;
}

@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-3deg); }
  20% { transform: translate(-3px, 0px) rotate(3deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(3deg); }
  50% { transform: translate(-1px, 2px) rotate(-3deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-3deg); }
  80% { transform: translate(-1px, -1px) rotate(3deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-3deg); }
}

@keyframes shake-2 {
  0% { transform: translate(2px, 2px) rotate(0deg); }
  10% { transform: translate(-2px, -4px) rotate(-3deg); }
  20% { transform: translate(-6px, 0px) rotate(3deg); }
  30% { transform: translate(6px, 4px) rotate(0deg); }
  40% { transform: translate(2px, -2px) rotate(3deg); }
  50% { transform: translate(-2px, 4px) rotate(-3deg); }
  60% { transform: translate(-6px, 2px) rotate(0deg); }
  70% { transform: translate(6px, 2px) rotate(-3deg); }
  80% { transform: translate(-2px, -2px) rotate(3deg); }
  90% { transform: translate(2px, 4px) rotate(0deg); }
  100% { transform: translate(2px, -4px) rotate(-3deg); }
}

@keyframes shake-3 {
  0% { transform: translate(4px, 4px) rotate(0deg); }
  10% { transform: translate(-4px, -8px) rotate(-3deg); }
  20% { transform: translate(-12px, 0px) rotate(3deg); }
  30% { transform: translate(12px, 8px) rotate(0deg); }
  40% { transform: translate(4px, -4px) rotate(3deg); }
  50% { transform: translate(-4px, 8px) rotate(-3deg); }
  60% { transform: translate(-12px, 4px) rotate(0deg); }
  70% { transform: translate(12px, 4px) rotate(-3deg); }
  80% { transform: translate(-4px, -4px) rotate(3deg); }
  90% { transform: translate(4px, 8px) rotate(0deg); }
  100% { transform: translate(4px, -8px) rotate(-3deg); }
}

@keyframes shake-4 {
  0% { transform: translate(8px, 8px) rotate(0deg); }
  10% { transform: translate(-8px, -16px) rotate(-3deg); }
  20% { transform: translate(-24px, 0px) rotate(3deg); }
  30% { transform: translate(24px, 16px) rotate(0deg); }
  40% { transform: translate(8px, -8px) rotate(3deg); }
  50% { transform: translate(-8px, 16px) rotate(-3deg); }
  60% { transform: translate(-24px, 8px) rotate(0deg); }
  70% { transform: translate(24px, 8px) rotate(-3deg); }
  80% { transform: translate(-8px, -8px) rotate(3deg); }
  90% { transform: translate(8px, 16px) rotate(0deg); }
  100% { transform: translate(8px, -16px) rotate(-3deg); }
}

/*** dash fade ***/

.juicy__fade {
  animation-name: fade;
  animation-duration: 1s;
  transition-timing-function: ease-in;
  animation-repeat: 1;
}

@keyframes fade {
  0% {opacity: 1; transform: scaleY(0.1) rotate(2deg); }
  25% {opacity: 0.5; transform: rotate(-2deg); }
  100% {opacity: 0; transform: rotate(0deg); }
}

.juicy__zipright {
  transform: scaleY(0.5) rotate(45deg);
  animation-name: zipright;
  animation-duration: 1s;
  transition-timing-function: linear;
  animation-repeat: 1;
}

@keyframes zipright {
  to {
    transform: translateX(10000px);
  }
}

/*** screen shake ***/

.juicy__screenshake {
  animation-name: screenshake, screenshake_bright;
  animation-duration: 1s;
  transition-timing-function: ease-out;
  animation-repeat: 1;
}

@keyframes screenshake {
  0% { transform: translate(8px, 8px) rotate(0deg); }
  2% { transform: translate(-8px, -16px) rotate(-3deg); }
  4% { transform: translate(-24px, 0px) rotate(3deg); }
  6% { transform: translate(24px, 16px) rotate(0deg); }
  8% { transform: translate(8px, -8px) rotate(3deg); }
  10% { transform: translate(-8px, 16px) rotate(-3deg); }
  12% { transform: translate(-24px, 8px) rotate(0deg); }
  14% { transform: translate(24px, 8px) rotate(-3deg); }
  16% { transform: translate(-8px, -8px) rotate(3deg); }
  18% { transform: translate(8px, 16px) rotate(-3deg); }
  20% { transform: translate(0px, 0px) rotate(0deg); }
  25% { transform: translate(4px, 4px) rotate(0deg); }
  30% { transform: translate(-4px, -8px) rotate(-3deg); }
  35% { transform: translate(-12px, 0px) rotate(3deg); }
  40% { transform: translate(12px, 8px) rotate(0deg); }
  45% { transform: translate(4px, -4px) rotate(3deg); }
  50% { transform: translate(-4px, 8px) rotate(-3deg); }
  55% { transform: translate(-12px, 4px) rotate(0deg); }
  60% { transform: translate(12px, 4px) rotate(-3deg); }
  65% { transform: translate(2px, 2px) rotate(0deg); }
  70% { transform: translate(-2px, -4px) rotate(-3deg); }
  75% { transform: translate(-6px, 0px) rotate(3deg); }
  80% { transform: translate(6px, 4px) rotate(0deg); }
  85% { transform: translate(3px, 1px) rotate(-3deg); }
  90% { transform: translate(-1px, -1px) rotate(3deg); }
  95% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-3deg); }
}

@keyframes screenshake_bright {
  0% {
    background-color: white;
  }
}

/*** bubbleup ***/

.juicy__bubbleup {
  opacity: 0;
  animation-name: bubbleup;
  animation-duration: 1s;
  transition-timing-function: ease-out;
  animation-fill-mode: forwards;
  animation-repeat: 1;
}

.juicy__bubbleup-1 {
  transform: translateY(300px) rotate(30deg);
}

.juicy__bubbleup-2 {
  transform: translateY(300px) rotate(-30deg);
}

.juicy__bubbleup-3 {
  transform: translateY(300px) rotate(60deg);
}

.juicy__bubbleup-4 {
  transform: translateY(300px) rotate(-60deg);
}

@keyframes bubbleup {
  0% {
    opacity: 0.0;
  }
  50% {
    opacity: 0.25;
  }
  100% {
    opacity: 1.0;
    transform: translateY(0px) rotate(0deg);
  }
}

/*** collision spark ***/

.juicy__collision-fade {
  animation-name: collision-fade;
  animation-duration: 1s;
  transition-timing-function: ease;
  animation-fill-mode: forwards;
  animation-repeat: 1;
}

@keyframes collision-fade {
  0% {
    opacity: 0.0;
  }
  10% {
    opacity: 1.0;
  }
  100% {
    opacity: 0.0;
    transform: translateY(-30px) rotate(180deg);
  }
}

/*** particle ***/

:root {
  --particle-jump: 0.25;
  --particle-direction: 1;
  --particle-spin: 0;
  --particle-size: 1;
}

.juicy__particle {
  animation-duration: calc(0.5s * var(--particle-jump));
  animation-delay: 0s;
  animation-repeat: 1;
  animation-name: particle-horizontal;
  transform-origin: center center;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  opacity: 0;
}

.juicy__particle > * {
  animation-duration: calc(0.5s * var(--particle-jump) + 0.2s);
  animation-delay: 0s;
  animation-repeat: 1;
  animation-name: particle;
  transform-origin: center center;
  animation-fill-mode: forwards;
}

@keyframes particle {
  0% {
    transform: translateY(0px) rotate(0deg) scale(calc(0.25 * var(--particle-size)));
    animation-timing-function: ease-out;
  }
  50% {
    transform: translateY(calc(-50px * var(--particle-jump))) rotate(calc(180deg * var(--particle-spin))) scale(calc(0.25 * var(--particle-size)));
    animation-timing-function: ease-in;
  }
  100% {
    transform: translateY(0px) rotate(calc(360deg * var(--particle-spin))) scale(calc(0.25 * var(--particle-size)));
  }
}

@keyframes particle-horizontal {
  0% {
    opacity: 1.0;
    transform: translateX(0px);
  }
  50% {
    opacity: 1.0;
    transform: translateX(calc(50px * var(--particle-jump) * var(--particle-direction)));
  }
  100% {
    opacity: 0.0;
    transform: translateX(calc(100px * var(--particle-jump) * var(--particle-direction)));
  }
}

/*** attack ***/

.juicy__attack-initiate {
  animation-duration: 1.5s;
  animation-repeat: 1;
  animation-name: attack-initiate;
  transform-origin: center bottom;
}

.juicy__attack-receive {
  animation-duration: 1.5s;
  animation-repeat: 1;
  animation-name: attack-receive;
  transform-origin: center bottom;
}

@keyframes attack-initiate {
  0% {
    transform: translateX(0px);
  }
  20% {
    transform: translateX(-5px) translateY(-5px) rotate(-33deg);
  }
  30% {
    transform: translateX(20px) translateY(-25px) rotate(45deg);
  }
  50% {
    transform: translateX(0px);
  }
  100% {
    transform: translateX(0px);
  }
}

@keyframes attack-receive {
  30% {
    transform: translateX(0px);
  }
  50% {
    transform: translateX(20px) translateY(-5px) rotate(40deg);
  }
  60% {
    transform: translateX(20px) translateY(0px) rotate(45deg);
  }
  70% {
    transform: translateX(25px) translateY(-5px) rotate(45deg);
  }
  75% {
    transform: translateX(30px) translateY(0px) rotate(20deg);
  }
  80% {
    transform: translateX(20px) translateY(-5px) rotate(-10deg);
  }
  100% {
    transform: translateX(0px);
  }
}

/*** smokepuff ***/

:root {
  --smoke-duration-scale: 1.0;
  --smoke-height-scale: 1.0;
  --smoke-size-scale: 1.0;
  --smoke-width-scale: 1.0;
  --smoke-delay: 0;
}

.juicy__smokepuff {
  animation-duration: calc(3s * var(--smoke-duration-scale));
  animation-delay: calc(3s * var(--smoke-delay));
  animation-iteration-count: infinite;
  animation-name: smokepuff-rise;
  animation-timing-function: linear;
  transform-origin: center bottom;
}

.juicy__smokepuff > * {
  animation-duration: calc(3s * var(--smoke-duration-scale));
  animation-delay: calc(3s * var(--smoke-delay));
  animation-iteration-count: infinite;
  animation-name: smokepuff;
  animation-timing-function: ease;
}

@keyframes smokepuff {
  0% { opacity: 0; transform: translateX(0px) scale(0); }
  50% { opacity: 1; transform: translateX(calc(-50px * var(--smoke-width-scale))) scale(var(--smoke-size-scale)); }
  100% { opacity: 0; transform: translateX(calc(-50px * var(--smoke-width-scale))) scale(var(--smoke-size-scale)); }
}

@keyframes smokepuff-rise {
  0% { transform: translateY(0); }
  100% { transform: translateY(calc(-100px * var(--smoke-height-scale))); }
}

/*** bubble ***/

:root {
  --bubble-height-scale: 1.0;
  --bubble-width-scale: 0.0;
  --bubble-size-scale: 0.5;
  --bubble-delay: 0;
}

.juicy__bubble {
  opacity: 0;
  animation-duration: calc((var(--bubble-size-scale) + 2) * 2s);
  animation-delay: calc(1s * var(--bubble-delay));
  animation-name: bubble-rise;
  transform-origin: center center;
  animation-timing-function: linear;
  animation-repeat: 1;
}

.juicy__bubble > * {
  animation-duration: calc(var(--bubble-size-scale) * 0.5s);
  animation-delay: calc(1s * var(--bubble-delay));
  animation-iteration-count: infinite;
  animation-name: bubble-wobble;
  transform-origin: center center;
}

@keyframes bubble-rise {
  0% { opacity: 0.5; transform: scale(calc(1.5 * var(--bubble-size-scale))); }
  100% { opacity: 0.5; transform: translate(calc(-50px * var(--bubble-width-scale)), calc(-100px * var(--bubble-height-scale))) scale(calc(1.5 * var(--bubble-size-scale))); }
}

@keyframes bubble-wobble {
  0% { transform: scale(1.0, 1.1); }
  50% { transform: scale(1.1, 1.0); }
  100% { transform: scale(1.0, 1.1); }
}

/*** title sweep in ***/

.juicy__titlesweep {
  animation: 2s sweepin forwards;
}

/* https://github.com/animate-css/animate.css/blob/master/animate.css */
@keyframes sweepin {
  0% {
    opacity: 0;
    transform: scale3d(0.1, 0.1, 0.1) translate3d(0, -1000px, 0);
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }

  60% {
    opacity: 1;
    transform: scale3d(0.475, 0.475, 0.475) translate3d(0, 60px, 0);
    animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1);
  }
}

/*** title spin in ***/

.juicy__titlespin {
  animation: 1s spinin forwards linear;
}

@keyframes spinin {
  0% {
    opacity: 0;
    animation-timing-function: ease;
    transform: scale(0.01) rotate(0deg);
  }

  95% {
    opacity: 1;
    animation-timing-function: linear;
    transform: scale(1.5) rotate(720deg);
  }

  100% {
    opacity: 1;
    transform: scale(1) rotate(720deg);
  }
}

/*** walk ***/

:root {
  --drift-duration: 1s;
}

.juicy__drift {
  transition-duration: var(--drift-duration);
  transition-timing-function: linear;
  transition-property: transform;
}

.juicy__walk {
  animation-duration: 0.6s;
  animation-name: walk;
  animation-iteration-count: infinite;
  transform-origin: center bottom;
}

@keyframes walk {
  0%, 50%, 100% {
    transform: rotate(0deg) translateY(-10px);
  }

  25% {
    transform: rotate(10deg) translateY(0px);
  }

  75% {
    transform: rotate(-10deg) translateY(0px);
  }
}

/*** hover ***/

.juicy__hover {
  animation-duration: 1s;
  animation-name: hover;
  animation-iteration-count: infinite;
  transition-timing-function: ease-in-out;
}

@keyframes hover {
  0%, 100% {
    transform: translateY(-10px);
  }

  50% {
    transform: translateY(-20px);
  }
}

.juicy__hover__shadow {
  animation-duration: 1s;
  animation-name: hover-shadow;
  animation-iteration-count: infinite;
  transition-timing-function: ease-in-out;
}

@keyframes hover-shadow {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.9);
  }
}

/*** idle animation ***/

.juicy__idle > * {
  animation-duration: 1s;
  animation-name: idle;
  animation-iteration-count: infinite;
  transition-timing-function: ease-in-out;
  transform-style: preserve3d;
}

@keyframes idle {
  0%, 100% {
    transform: none;
    transform-origin: center bottom;
  }

  50% {
    /*transform: translate(0%, -100%);*/
    transform: perspective(20px) rotateX(-2deg) scaleY(0.85);
    transform-origin: center bottom;
  }
}

    .hidden {
        /*display: none !important;*/
        visibility: hidden !important;
    }
    .two-column-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 1em 0em;
        align-items: center;
    }
    .title {
        text-align: center;
        font-size: 1.5em;
    }
    input[type="button"] {
        cursor: pointer;
    }
    input {
        border: 2px solid rgb(158 158 158);
        padding: 0.8em;
        padding-top: 0.5em;
        padding-bottom: 0.5em;
        width: 100%;
        background-color: transparent;
        color: white;
        border-radius: 4px;

        margin-top: 1em;
        text-transform: uppercase;
    }
    .main-content {
        padding: 0.7em;
    }
    .text-shadow {
        text-shadow: 0px 0px 4px black, 0px 0px 4px black, 0px 0px 4px black, 0px 0px 4px black, 0px 0px 4px black, 0px 0px 4px black;
    }
    .auto-cols {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
    }
    .small-button {
        cursor: pointer;
        padding: 0.5em;
        margin: 0.5em;
        border: 2px solid rgb(158 158 158);
        background-color: transparent;
        color: white;
        border-radius: 4px;
        text-align: center;
        text-transform: uppercase;
    }
    </style>
`;

/**
 * Solid animations to use
 *  juicy__attack-initiate
    juicy__attack-receive
    juicy__collision-fade
    juicy__bounce
    juicy__bounce_shadow
*/