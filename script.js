import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

let container, camera, renderer, controls
let sceneL, sceneR

let windowCenter = window.innerWidth / 2

init()

function init() {
	container = document.querySelector('.container')

	sceneL = new THREE.Scene()
	sceneL.background = new THREE.Color(0xbcd48f)

	sceneR = new THREE.Scene()
	sceneR.background = new THREE.Color(0x8fbcd4)

	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	)
	camera.position.z = 0.01

	controls = new OrbitControls(camera, container)
	controls.enableZoom = false
	controls.enablePan = false
	controls.rotateSpeed = -0.25
	initMeshes()

	const light = new THREE.HemisphereLight(0xffffff, 0x444444, 3)
	light.position.set(-2, 2, 2)
	sceneL.add(light.clone())
	sceneR.add(light.clone())

	renderer = new THREE.WebGLRenderer({ antialias: true })
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(window.innerWidth, window.innerHeight)
	renderer.setScissorTest(true)
	renderer.setAnimationLoop(render)
	container.appendChild(renderer.domElement)

	window.addEventListener('resize', onWindowResize)
}

function initMeshes() {
	const loader = new GLTFLoader()

	loader.load(
		'static/models/Sword/sword.glb',
		glb => {
			console.log('success')
            glb.scene.position.set(0.75, 0,-1)
			sceneR.add(glb.scene)
		},
		progress => {
			console.log('progress')
			console.log(progress)
		},
		error => {
			console.log('error')
			console.log(error)
		}
	)

	const textures = getTexturesFromAtlasFile('static/images/sun_temple_stripe.jpg', 6)

	const materials = []

	for (let i = 0; i < 6; i++) {
		materials.push(new THREE.MeshBasicMaterial({ map: textures[i] }))
	}
	const skyBox = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials)
	skyBox.geometry.scale(1, 1, -1)
	sceneL.add(skyBox)
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize(window.innerWidth, window.innerHeight)
}

function render() {
	renderer.setScissor(0, 0, windowCenter, window.innerHeight)
	renderer.render(sceneL, camera)

	renderer.setScissor(windowCenter, 0, window.innerWidth, window.innerHeight)
	renderer.render(sceneR, camera)
}

function getTexturesFromAtlasFile(atlasImgUrl, tilesNum) {
	const textures = []

	for (let i = 0; i < tilesNum; i++) {
		textures[i] = new THREE.Texture()
	}

	new THREE.ImageLoader().load(atlasImgUrl, image => {
		let canvas, context
		const tileWidth = image.height

		for (let i = 0; i < textures.length; i++) {
			canvas = document.createElement('canvas')
			context = canvas.getContext('2d')
			canvas.height = tileWidth
			canvas.width = tileWidth
			context.drawImage(
				image,
				tileWidth * i,
				0,
				tileWidth,
				tileWidth,
				0,
				0,
				tileWidth,
				tileWidth
			)
			textures[i].colorSpace = THREE.SRGBColorSpace
			textures[i].image = canvas
			textures[i].needsUpdate = true
		}
	})

	return textures
}
