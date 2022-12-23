import menuBg from '../../assets/images/menu.png';
import QRCode from 'qrcode';

export class MenuComponent extends HTMLElement {

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = `
		<style>
			:host {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 100vh;

				background-image: url(${menuBg});
				background-position: center;
				background-repeat: no-repeat;
				background-size: contain;
			}

			button {
				background-color: #4C50AF; /* Blue */
				border: none;
				color: white;
				text-align: center;
				text-decoration: none;
				display: inline-block;
				font-size: 16px;
				margin: 2rem;
				width: 10rem;
				height: 4rem;
			}
			button:hover {
				background-color: #6C70DF; /* Blue */
			}
			.main {
				position: absolute;
				left: 30%;
				top: 20%;
			}
			.qrwrapper {
				position: absolute;
				right: 1rem;
				top: 1rem;
				text-align: center;
			}
			.buttonBar {
				display: flex;
				flex-direction: column;
			}
		</style>

		<div class="main">
			<div class="buttonBar">
				<button id="startGame">Start Game</button>
				<button id="fullScreen">Full Screen</button>
			</div>
		</div>
		<div class="qrwrapper">
			<small>play on mobile!</small><br>
			<canvas id="qrcanvas"></canvas>
		</div>
	`;
	}

	connectedCallback() {
		this.shadowRoot.querySelector('#startGame').addEventListener('click', () => {
			this.dispatchEvent(new CustomEvent('Start'));
			this.dispatchEvent(new CustomEvent('button-pressed'));
		});

		this.shadowRoot.querySelector('#fullScreen').addEventListener('click', () => {
			const elem = document.documentElement;

			elem.requestFullscreen({ navigationUI: 'show' }).then(() => { }).catch(err => {
				alert(`An error occurred while trying to switch into full-screen mode: ${err.message} (${err.name})`);
			});
		});

		const canvas = this.shadowRoot.getElementById('qrcanvas');
 
		QRCode.toCanvas(canvas, window.location.toString(), function (error) {
			if (error) console.error(error);
		});

	}

}
