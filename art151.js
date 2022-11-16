

//draw sphere at specified position of specified diameter
function createSphere(x, y, z, diam, scene) {
    // babylon built-in 'sphere' shape.
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: diam, segments: 32 }, scene);
    // Move the x, y, z position
    sphere.position = new BABYLON.Vector3(x, y, z);
    return sphere;
}

//draw box at specified position of specified length, width, depth
function createBox(x, y, z, w, h, d, scene) {
    // babylon built-in 'sphere' shape.
    var box = BABYLON.MeshBuilder.CreateBox("box", { height: h, width: w, depth: d }, scene);
    // Move the x, y, z position
    box.position = new BABYLON.Vector3(x, y, z);
    return box;
}

//create material from image file
function fileMat(file, scene) {
    //create material
    var mat = new BABYLON.StandardMaterial('material', scene);
    mat.diffuseTexture = new BABYLON.Texture(file, scene);
    return mat;
}

//create material from hex color
function hexMat(hex, scene) {
    var mat = new BABYLON.StandardMaterial('material', scene);
    mat.diffuseColor = BABYLON.Color3.FromHexString(hex, scene);
    return mat;
}

//recreates p5 lerpColor functionality with babylon
function babLerpColor(c1, c2, lerp, scene) {
    //convert from hex if hashtag present in input
    if (c1.indexOf('#') == 0) {
        c1 = BABYLON.Color3.FromHexString(c1, scene);
    }
    if (c2.indexOf('#') == 0) {
        c2 = BABYLON.Color3.FromHexString(c2, scene);
    }
    let c = {};
    //interpolate r g and b  values
    for (let h of ['r', 'g', 'b']) {
        c[h] = c1[h] * lerp + c2[h] * (1 - lerp);
    }
    return new BABYLON.Color3(c.r, c.g, c.b);
}



//creates animation for a discrete property
function discreteAnim(type, dim, start_val, sub_vals, frameRate, seconds) {
    var anim_name;
    var anim_type;
    var keys = [];
    if (Array.isArray(sub_vals) == false) {
        sub_vals = [sub_vals];
    }
    for (let [i, val] of sub_vals.entries()) {
        if (dim) {
            anim_name = type + "_" + dim;
            anim_type = type + "." + dim;
            if (i == 0) {
                keys.push(start_val[dim]);
            }
            keys.push(val[dim]);
        } else {
            anim_name = type;
            anim_type = type;
            if (i == 0) {
                keys.push(start_val);
            }
            keys.push(val);
        }
    }

    var anim = new BABYLON.Animation(anim_name, anim_type, frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var keyFrames = [];

    for (var j = 0; j < keys.length; j++) {
        keyFrames.push({ frame: j * frameRate * (seconds), value: keys[j] });
    }

    anim.setKeys(keyFrames);
    return anim;
}


function animate(animations, scene, seconds = 3, loop = false) {
    //generates discrete animation to add to objects anims

    var frameRate = 5;
    var all_animations = [];
    var start = 0;
    if (Array.isArray(animations) == false) {
        animations = [animations];
    }
    //iterate through each animation object
    for (let anim of animations) {
        anim.anims = [];

        if (anim.dims) { //if there are dimensions, add one animation for each
            for (const dim of anim.dims) {
                anim.anims.push(discreteAnim(anim.prop, dim, anim.subj[anim.prop], anim.val, frameRate, seconds));
            }
        } else { //otherwise add just one animation
            anim.anims.push(discreteAnim(anim.prop, false, anim.subj[anim.prop], anim.val, frameRate, seconds));
        }

        //initalize animationz
        all_animations.push(anim.anims);
        var anim_turns = 1;
        if (Array.isArray(anim.val)) {
            anim_turns = anim.val.length;
        }
        scene.beginDirectAnimation(anim.subj, anim.anims, 0, seconds * frameRate * anim_turns, loop);

    }

    return all_animations;
}


class meshModel {
    //model constructor
    constructor(file, scale = 1, x = 0, y = 0, z = 0, name = "mesh", scene) {
        //gen position variable based on XYZ values
        var position = new BABYLON.Vector3(x, y, z);
        this.position = position;

        this.scale = scale; //scale based on user input
        this.name = name; //give mesh a name so it can be retrieved with getMeshes method
        //split file into file and folder variable to fit into Babylon native function
        var folder;
        if (file.lastIndexOf('/') >= 0) {
            folder = file.slice(0, file.lastIndexOf('/') + 1);
            file = file.slice(file.lastIndexOf('/') + 1)
        } else {
            folder = './'
        }
        //place and scale each mesh in model
        let model = BABYLON.SceneLoader.ImportMesh(
            null,
            folder,
            file,
            scene,
            function (meshes) {
                for (const [i, mesh] of meshes.entries()) {
                    mesh.position = position;
                    mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
                    mesh.name = name + '-' + i;
                }
            }
        );

    }
    //assigns an array of this model's meshes to this.meshes and returns it
    //MUST BE EXECUTED IN scene.executeWhenReady(() => {})
    getMeshes(meshes) {
        this.meshes = meshes.filter(mesh => mesh.name.slice(0, this.name.length) == this.name);
        return this.meshes;
    }

    //set x, y, and z rotation to values specified by
    rotate(x, y, z, scene) {
        var meshes = this.meshes;
        var mat = hexMat('#ff0000');
        meshes.map(m => m.rotation = new BABYLON.Vector3(x, y, z));
    }

    getAnims(prop, dims, val){
        return this.meshes.map(x => {subj: x; prop:prop; dims: dims; val:val});
    }
}

//reference: https://playground.babylonjs.com/#G2F8LN#5
function addClickEvent(mesh, prop, dims, val, scene) {
        mesh.isPickable = true;
        mesh.actionManager = new BABYLON.ActionManager(scene);
        mesh.actionManager
            .registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger, function (bjsevt) {
                        // console.log(bjsevt);
                        animate({subj: mesh, prop: prop, dims:dims, val: val});
                    }
                )
            )

}