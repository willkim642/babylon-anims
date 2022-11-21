var canvas = document.getElementById("renderCanvas");
var meshlist = [];
var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); };
var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    var sphere1 = createSphere(-10, 0.5, -4, 1);

    var box1 = createBox(0, -1, -4, 30, 2, 2);
    var box2 = createBox(2, 1, 2, 2, 2, 2);

    var toaster = new meshModel('toast_acrobatics.glb', 3);
    toaster.position.x = 2;
    var heart1 = new meshModel('emoji_heart.glb', 3);
    var heart2 = new meshModel('emoji_heart.glb', 2);
    var heart3 = new meshModel('emoji_heart.glb', 2);
    heart1.position.x = 0;
    heart2.position.x = 0.5;
    heart3.position.x = -0.5;

    var anim1 = { subj: heart1.position, prop: 'y', val: 3 }; 
    var anim2 = { subj: heart2.position, prop: 'y', val: 5 }; 
    var anim3 = { subj: heart3.position, prop: 'y', val: 2 }; 
    var anim4 = { subj: sphere1.position, prop: 'x', val: 45 };
    var anim5 = { subj: sphere1.rotation, prop: 'x', val: -Math.PI / 2 };

    var anims = [anim1, anim2, anim3, anim4, anim5];
    animate(anims, scene, 10, true);

    // Our built-in 'ground' shape.
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 30, height: 10}, scene);

    return scene;
};
window.initFunction = async function () {
    var asyncEngineCreation = async function () {
        try {
            return createDefaultEngine();
        } catch (e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }

    window.engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    startRenderLoop(engine, canvas);
    window.scene = createScene();
};
initFunction().then(() => {
    sceneToRender = scene
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});


