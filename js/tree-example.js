var Tree = Tree || {};
Tree.Portfolio = new function() {

	//private vars
	var container = document.createElement('div'),
		camera, cameraDummy, cameraTargetDummy, indendedCameraPosition, scene, renderer, projector, light, objects = [],
		blogPosts = [],
		portfolioPosts = [],
		selectedBlog = 0,
		running = true,
		mouseX = 0,
		mouseY = 0,
		singleMaterial, zmaterial = [],
		material_depth, width = window.innerWidth,
		height = window.innerHeight,
		near = 1,
		far = 30000,
		windowHalfX = window.innerWidth / 2,
		windowHalfY = window.innerHeight / 2,
		isOrbiting = true,
		objectOfInterest, thisObj = this;

	postprocessing = {
		enabled: false,
		v1: true,
		v2: true
	};

	this.pause = function() {
		running = false;
	}

	this.play = function() {
		if (!running) {
			running = true;
			this.animate();
		}
	}

	this.init = function() {

		// add listeners
		addEventListeners();

		document.body.appendChild(container);

		scene = new THREE.Scene();
		sceneCube = new THREE.Scene();
		projector = new THREE.Projector();
		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		camera = new THREE.Camera(41, width / height, near, far);
		cameraDummy = new THREE.Object3D();
		cameraTargetDummy = new THREE.Object3D();
		indendedCameraPosition = new THREE.Vector3(0, 0, 0);
		scene.fog = new THREE.FogExp2(0xEEEEEE, 0.00022);

		material_depth = new THREE.MeshDepthMaterial();

		camera.position.set(20, 250, 1200);
		camera.target.position.set(0, 50, 200);

		$(container).css("width", "100%");
		$(container).css("height", "100%");

		var positions = [
			[6200, 256],
			[5448, -3280],
			[4872, -4928],
			[4600, -1536],
			[4600, -96],
			[4440, 1536],
			[4840, 4064],
			[4184, 2660],
			[3336, 3600],
			[2376, 1936],
			[3144, -176],
			[2536, -1840],
			[2776, -2944],
			[2344, -4416],
			[616, -5024],
			[824, -3072],
			[-1032, -2960],
			[-2120, -5376],
			[-3512, -4576],
			[-2824, -3408],
			[-2376, -1840],
			[-2840, -480],
			[-4408, -1360],
			[-5256, -2592],
			[-6168, -976],
			[-5800, 400],
			[-4792, 1680],
			[-2812, 1680],
			[-1800, 2544],
			[-3496, 3296],
			[-6312, 3984],
			[-4968, 5424],
			[-2648, 5440],
			[-392, 3104],
			[1048, 3200],
			[1000, 3936],
			[-488, 3856],
			[984, 5040],
			[1000, 6320],
			[-392, 4784],
			[-408, 5456],
			[-472, 6928],
			[2248, 752],
			[2264, -784],
			[1448, -2128],
			[56, -2432],
			[-1528, -1968],
			[-1928, 432],
			[-1320, 1776],
			[1272, 1856],
			[904, 2416],
			[984, 4352],
			[1016, 5600],
			[-376, 2384],
			[-360, 4192],
			[-360, 6064],
			[-396, 6704]
		];


		var tempX, tempY;
		for (var i = 0; i < positions.length; i++) {
			tempX = Math.round(positions[i][0] - 200);
			tempY = Math.round(positions[i][1]);
			positions[i][0] = tempX;
			positions[i][1] = tempY;
		}

		var loader = new THREE.JSONLoader();
		loader.load({
			model: "js/tree.js",
			callback: function(geo) {
				geo.materials[0][0].shading = THREE.FlatShading;

				var material = [new THREE.MeshFaceMaterial()];

				mesh = new THREE.Mesh(geo, material);
				mesh.position.x = 100;
				mesh.position.y = 2700;
				mesh.position.z = -500;
				mesh.scale.x = mesh.scale.y = mesh.scale.z = 600;
				mesh.overdraw = true;
				scene.addObject(mesh);

				for (var i = 0; i < positions.length; i++) {
					mesh = new THREE.Mesh(geo, material);
					mesh.position.y = 650;
					mesh.position.x = positions[i][0];
					mesh.position.z = positions[i][1];
					mesh.rotation.y = Math.random() * 2 * Math.PI;
					mesh.scale.x = mesh.scale.y = mesh.scale.z = 250;
					mesh.overdraw = true;
					scene.addObject(mesh);
				}
			}
		});

		var loader = new THREE.JSONLoader();
		loader.load({
			model: "js/initials.js",
			callback: function(geo) {
				geo.materials[0][0].shading = THREE.FlatShading;

				var material = [new THREE.MeshFaceMaterial()];

				mesh = new THREE.Mesh(geo, material);
				mesh.position.x = 100;
				mesh.position.y = 2700;
				mesh.position.z = -500;
				mesh.scale.x = mesh.scale.y = mesh.scale.z = 600;
				mesh.overdraw = true;
				scene.addObject(mesh);

			}
		});


		light = new THREE.DirectionalLight(0xffffff);
		light.position.set(0.5, 0.5, 1);
		light.position.normalize();
		scene.addLight(light);

		var quality = 32,
			step = 1024 / quality;
		var plane = new THREE.PlaneGeometry(14000, 14000, quality - 1, quality - 1);
		for (var i = 0, l = plane.vertices.length; i < l; i++) {
			var x = i % quality,
				y = ~~ (i / quality);
			plane.vertices[i].position.z = Math.random() * 100;
		}
		plane.computeCentroids();
		var material = [, new THREE.MeshBasicMaterial({
			color: 0xFF0000,
			wireframe: true,
			opacity: 0.4,
			doubleSided: false
		})];
		mesh = new THREE.Mesh(plane, material);
		mesh.position.y = -400;
		mesh.rotation.x = -90 * Math.PI / 180;
		mesh.overdraw = true;
		scene.addObject(mesh);

		renderer.setSize(width, height);
		renderer.sortObjects = true;
		renderer.initMaterial(material, scene.lights, scene.fog);

		wrapTextNodes($("#welcome")[0]);
		objects.push(build3DObject($($("#welcome")[0]), "welcome"));
		welcome = objects[0];
		$('#welcome').css('display', 'none');

		welcome.position.set(100, -150, 6352);
		scene.addObject(welcome);
		initPostprocessing();
		renderer.autoClear = false;

		var effectController = {
			focus: 1.3,
			aperture: 0.023,
			dof: false,
			v1: true,
			v2: true
		};

		container.appendChild(renderer.domElement);

		var matChanger = function() {
				postprocessing.bokeh_uniforms["focus"].value = effectController.focus;
				postprocessing.bokeh_uniforms["aperture"].value = effectController.aperture;
				postprocessing.enabled = effectController.dof;
				postprocessing.v1 = effectController.v1;
				postprocessing.v2 = effectController.v2;
			};

		var gui = new GUI();
		gui.add(effectController, "focus", 0.25, 1.75, 0.025).onChange(matChanger);
		gui.add(effectController, "aperture", 0.001, 0.1, 0.001).onChange(matChanger);
		gui.add(effectController, "dof", false).onChange(matChanger);
		gui.add(effectController, "v1", false).onChange(matChanger);
		gui.add(effectController, "v2", false).onChange(matChanger);
	}


	this.updateBlogPosts = function() {
		blogPosts = [];
		$("#blogEntries > ul").empty()
		$('.blog').each(function(index) {
			console.info($('.blog').html());
			wrapTextNodes($(".blog")[index]);
			objects.push(build3DObject($($('.blog')[index]), "blogPost"));
			blogPosts.push(objects[objects.length - 1]);
			var title = $($(".blog")[index]).find("h2").text();
			$("#blogEntries > ul").append("<li><a href='#' title='" + title + "' onclick='Tree.Portfolio.viewBlogPost(" + index + "); return false;'>" + title + "</a></li>");
		});
		$('.blog').css('display', 'none');

		var blogPoints = getNPointsOnCircle([0, 0], 500, 5);
		for (var object in blogPosts) {
			blogPosts[object].position.set(blogPoints[object % blogPoints.length].x, 650 * Math.floor(object / 5) + 550, blogPoints[object % blogPoints.length].y);
			blogPosts[object].rotation.set(0, ((5 - (object % 5)) / 5) * (Math.PI * 2) + (Math.PI / 2), 0);
			scene.addObject(blogPosts[object]);
		}

	}

	this.getIsOrbiting = function() {
		return isOrbiting;
	}

	this.setIsOrbiting = function(bool) {
		isOrbiting = bool;
	}

	this.gotoAbout = function() {
		if (isOrbiting) isOrbiting = false;
		cameraTargetDummy.position.x = objects[0].position.x;
		cameraTargetDummy.position.y = objects[0].position.y;
		cameraTargetDummy.position.z = objects[0].position.z;
		indendedCameraPosition = getCameraPlacementForObject(objects[0], 1000);
		cameraDummy.position.x = indendedCameraPosition.x;
		cameraDummy.position.y = indendedCameraPosition.y;
		cameraDummy.position.z = indendedCameraPosition.z;
		objectOfInterest = objects[0];
		return;
	}


	this.viewBlogPost = function(index) {
		if (isOrbiting) isOrbiting = false;
		cameraTargetDummy.position.x = blogPosts[index].position.x;
		cameraTargetDummy.position.y = blogPosts[index].position.y;
		cameraTargetDummy.position.z = blogPosts[index].position.z;
		indendedCameraPosition = getCameraPlacementForObject(blogPosts[index], 1200);
		cameraDummy.position.x = indendedCameraPosition.x;
		cameraDummy.position.y = indendedCameraPosition.y;
		cameraDummy.position.z = indendedCameraPosition.z;
		objectOfInterest = blogPosts[index];
		return;
	}


	this.animate = function() {
		if (running) {
			requestAnimationFrame(thisObj.animate);
			thisObj.render();
		}
	}

	/**
	 * Renders the current state
	 */
	this.render = function() {

		TWEEN.update();
		if (isOrbiting) {
			var timer = new Date().getTime() * 0.0001;
			cameraDummy.position.x = Math.cos(timer) * 4400;
			cameraDummy.position.y = Math.cos(timer) * 500 + 800;
			cameraDummy.position.z = Math.sin(timer) * 4400;
			cameraTargetDummy.position.x = 0;
			cameraTargetDummy.position.y = 1000;
			cameraTargetDummy.position.z = 0;
		}

		camera.position.x = -(camera.position.x - cameraDummy.position.x) / 30 + camera.position.x;
		camera.position.y = -(camera.position.y - cameraDummy.position.y) / 30 + camera.position.y;
		camera.position.z = -(camera.position.z - cameraDummy.position.z) / 30 + camera.position.z;

		camera.target.position.x = -(camera.target.position.x - cameraTargetDummy.position.x) / 30 + camera.target.position.x;
		camera.target.position.y = -(camera.target.position.y - cameraTargetDummy.position.y) / 30 + camera.target.position.y;
		camera.target.position.z = -(camera.target.position.z - cameraTargetDummy.position.z) / 30 + camera.target.position.z;

		for (var i = 0, l = scene.objects.length; i < l; i++) {
			var object = scene.objects[i];
		}



		if (postprocessing.enabled) {

			renderer.clear();

			// Render scene into texture
			if (postprocessing.v1) {
				scene.overrideMaterial = null;
			}
			renderer.render(scene, camera, postprocessing.rtTextureColor, true);
			// Render depth into texture
			if (postprocessing.v2) {
				scene.overrideMaterial = material_depth;
			}
			renderer.render(scene, camera, postprocessing.rtTextureDepth, true);
			// Render bokeh composite
			renderer.render(postprocessing.scene, postprocessing.camera);


		} else {
			scene.overrideMaterial = null;
			renderer.clear();
			renderer.render(scene, camera);

		}
	}

	function initPostprocessing() {

		postprocessing.scene = new THREE.Scene();

		postprocessing.camera = new THREE.Camera();
		postprocessing.camera.projectionMatrix = THREE.Matrix4.makeOrtho(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -10000, 10000);
		postprocessing.camera.position.z = 100;

		var pars = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat
		};
		postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget(window.innerWidth, height, pars);
		postprocessing.rtTextureColor = new THREE.WebGLRenderTarget(window.innerWidth, height, pars);

		var bokeh_shader = ShaderExtras["bokeh"];

		postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone(bokeh_shader.uniforms);

		postprocessing.bokeh_uniforms["tColor"].texture = postprocessing.rtTextureColor;
		postprocessing.bokeh_uniforms["tDepth"].texture = postprocessing.rtTextureDepth;
		postprocessing.bokeh_uniforms["focus"].value = 1.3;
		postprocessing.bokeh_uniforms["aperture"].value = 0.023;
		postprocessing.bokeh_uniforms["aspect"].value = window.innerWidth / height;

		postprocessing.materialBokeh = new THREE.MeshShaderMaterial({

			uniforms: postprocessing.bokeh_uniforms,
			vertexShader: bokeh_shader.vertexShader,
			fragmentShader: bokeh_shader.fragmentShader

		});

		postprocessing.quad = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth, window.innerHeight), postprocessing.materialBokeh);
		postprocessing.quad.position.z = -500;
		postprocessing.scene.addObject(postprocessing.quad);

	}

	function getNPointsOnCircle(center, radius, n) {
		var alpha = (Math.PI * 2) / n;
		var points = [];
		var i = -1;
		while (++i < n) {
			var theta = alpha * i;
			points[i] = {};
			points[i].x = center[0] + Math.cos(theta) * radius;
			points[i].y = center[1] + Math.sin(theta) * radius;
		}
		return points;
	}

	function getCameraPlacementForObject(object, distance) {
		var tempPos = new THREE.Vector3();
		tempPos.x = object.position.x + Math.sin(object.rotation.y - (Math.PI * 2)) * distance;
		tempPos.y = object.position.y;
		tempPos.z = object.position.z + Math.cos(object.rotation.y - (Math.PI * 2)) * distance;
		return tempPos;
	}

	function getOffsetPositionOnScreen(obj) {
		var pos = obj.object.position.clone();
		projScreenMat = new THREE.Matrix4();
		projScreenMat.multiply(camera.projectionMatrix, camera.matrixWorldInverse);
		projScreenMat.multiplyVector3(pos);
		return {
			x: (pos.x + 1) * window.innerWidth / 2,
			y: (-pos.y + 1) * window.innerHeight / 2
		};
	}

	function wrapTextNodes(node) {
		var whitespace = /^\s*$/;

		function getTextNodes(node) {
			if (node.nodeType == 3) {
				if (!whitespace.test(node.nodeValue)) {
					var words = node.nodeValue.split(' ');
					var newString = '';
					var parentSpan = document.createElement("span");
					for (word in words) {
						var span = document.createElement("span");
						span.innerHTML = words[word] + ' ';
						parentSpan.appendChild(span);
					}
					node.parentNode.replaceChild(parentSpan, node);
				}
			} else {
				for (var i = 0, len = node.childNodes.length; i < len; ++i) {
					getTextNodes(node.childNodes[i]);
				}
			}
		}
		try {
			getTextNodes(node);
		} catch (e) {}
	}

	function build3DObject(node, objectClass) {
		var ctx = document.createElement("canvas");
		var xc = ctx.getContext("2d");
		var ctx2 = document.createElement("canvas");
		var xc2 = ctx2.getContext("2d");
		var xm = new THREE.MeshBasicMaterial({
			map: new THREE.Texture(ctx2)
		});
		xm.transparent = true;

		ctx.width = ctx2.width = node.width() + 40;
		ctx.height = node.height();
		ctx2.height = 600;

		var object = new THREE.Mesh(new THREE.PlaneGeometry(node.width(), 600, 50, 50), xm);
		object["events"] = [];
		object.width = node.width() + 40;
		object.height = 600;
		object.scrollAmount = 0;
		object.events = [];
		object.objectClass = objectClass || "generic";
		object.xc = xc;
		object.xc2 = xc2;
		object.xm = xm;
		object.scrollbar = {
			scrollAmount: 0,
			heightRatio: ctx2.height / ctx.height * ctx2.height,
			initialPos: 0,



			update: function(yPos) {
				if (ctx.height > ctx2.height) {
					object.scrollbar.scrollAmount = object.scrollbar.scrollAmount + (yPos - object.scrollbar.initialPos);
					console.log(object.scrollbar.scrollAmount);
					xc2.fillStyle = "rgba(0, 0, 0, 0.5)";
					xc2.fillRect(ctx2.width - 25, this.scrollAmount + 150, 15, this.heightRatio);
					var tmp = xc.getImageData(0, this.scrollAmount, ctx.width, ctx.height);
					xc2.putImageData(tmp, 0, 0);
					xm.map.needsUpdate = true;
				} else {
					//pass
				}
			},

			hit: function(x, y) {
				if (x > ctx2.width - 25 && x < ctx2.width - 10) {
					if (y > this.scrollAmount + 150 && y < (this.scrollAmount + 150 + this.heightRatio)) {
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}

			},

			mouseDown: function(y) {},

			mouseMove: function(event) {},

			mouseUp: function() {

			}



		};


		xc.fillStyle = "rgb(255,255,255)";
		xc.globalAlpha = 0.8;
		xc.fillRect(0, 0, node.width() + 40, node.height());

		node.find('img').each(function(index) {
			var thisNode = $(node.find('img')[index]);
			xc.globalAlpha = 1;
			try {
				xc.drawImage(node.find('img')[index], thisNode.offset().left, thisNode.offset().top, thisNode.width(), thisNode.height());
			} catch (e) {
				console.error(e.message);
			}
			if ($(thisNode[0].parentNode).is('a')) {}
			xc.globalAlpha = 0.6;
		});

		node.find("hr").each(function(index) {
			var thisNode = $(node.find('hr')[index]);
			xc.beginPath();
			xc.strokeStyle = "#999";
			xc.moveTo(thisNode.position().left, thisNode.position().top + 0.5);
			xc.lineTo(thisNode.position().left + thisNode.width(), thisNode.position().top + 0.5);
			xc.stroke();
		});

		node.find('a').each(function(el) {
			var thisNode = $(node.find('a')[el]);
			if (object.events['click'] === undefined) object.events['click'] = [];
			xc.fillStyle = thisNode.css("color") || "rgba(255, 0, 0, 0.5)";
			xc.globalAlpha = 0.6;
			xc.fillRect(thisNode.position().left, thisNode.position().top + thisNode.height(), thisNode.width(), 1);
			object.events['click'].push([
				[thisNode.position().left, thisNode.position().top - 10, thisNode.width(), thisNode.height() * 1.2], function() {
					window.open(thisNode.attr("href"), 'New Window')
				}]);
		});


		node.find('span').each(function(el) {
			var thisNode = $(node.find('span')[el]);
			var parentNode = $(thisNode[0].parentNode);

			if (parentNode.data("events")) {
				for (evtType in parentNode.data("events")) {
					for (evt in parentNode.data("events")[evtType]) {
						if (object.events[evtType] == undefined) object.events[evtType] = [];
						xc.fillStyle = "rgb(200,0,0)";
						xc.globalAlpha = 0.2;
						xc.fillRect(thisNode.position().left, thisNode.position().top, thisNode.width(), thisNode.height());
						object.events[evtType].push([
							[thisNode.position().left, thisNode.position().top - 20, thisNode.width(), thisNode.height() * 1.3], parentNode.data("events")[evtType][evt]["handler"]
						]);
					}
				}
			}
			var events = ['onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmousemove', 'onmouseout', 'onkeydown', 'onkeypress', 'onkeyup'];
			$(events).each(function(evtType) {
				if (parentNode[0][events[evtType]]) {
					if (object.events[events[evtType].replace("on", '')] === undefined) object.events[events[evtType].replace("on", '')] = [];
					xc.fillStyle = "rgb(200,0,0)";
					xc.globalAlpha = 0.2;
					xc.fillRect(thisNode.position().left, thisNode.position().top, thisNode.width(), thisNode.height());
					object.events[events[evtType].replace("on", '')].push([
						[thisNode.position().left, thisNode.position().top - 20, thisNode.width(), thisNode.height() * 1.3], parentNode[0][events[evtType]]
					]);
				}
			});

			if (thisNode[0].firstChild.nodeType == 3) {
				xc.fillStyle = thisNode.css("color") || "rgba(255, 0, 0, 0.5)";
				xc.globalAlpha = thisNode.css("opacity");
				xc.font = thisNode.css("font-style") + " " + thisNode.css("font-weight") + " " + thisNode.css("font-size") + " " + thisNode.css("font-family");
				xc.fontWeight = thisNode.css("font-weight");
				xc.textBaseline = "top";
				xc.fillText(thisNode.text(), thisNode.offset().left, thisNode.offset().top);
			}

		});

		try {
			var tmp = xc.getImageData(0, 0, ctx.width, ctx.height);
			xc2.putImageData(tmp, 0, 0);
			object.scrollbar.update();
		} catch (e) {
			console.error(e.message);
		}

		object.doubleSided = true;
		xm.map.needsUpdate = true;

		return object;

	}

	function addEventListeners() {
		// window event
		$(window).resize(callbacks.windowResize);
		$(window).keydown(callbacks.keyDown);

		// click handler
		$(document.body).mousedown(callbacks.mouseDown);
		$(document.body).mouseup(callbacks.mouseUp);
		$(document.body).click(callbacks.mouseClick);
		$(document.body).mousemove(callbacks.mouseMove);

		// GUI events
		$(".gui-set a").click(callbacks.guiClick);
		$(".gui-set a.default").trigger('click');
	}

	/**
	 * Simple handler function for
	 * the events we don't care about
	 */

	function cancel(event) {
		if (event.preventDefault) event.preventDefault();

		return false;
	}

	/**
	 * Internal callbacks object
	 */
	callbacks = {
		mouseDown: function(event) {

			mouseX = (event.clientX - windowHalfX);
			mouseY = (event.clientY - windowHalfY);
			event.preventDefault();

			var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2.2 - 1.1, -(event.clientY / window.innerHeight) * 2.2 + 1.15, .5);
			projector.unprojectVector(vector, camera);

			var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());

			var intersects = ray.intersectObjects(objects);

			if (intersects.length > 0) {

				if (intersects[0].distance > 1400) {
					if (isOrbiting) isOrbiting = false;
					cameraTargetDummy.position.x = intersects[0].object.position.x;
					cameraTargetDummy.position.y = intersects[0].object.position.y;
					cameraTargetDummy.position.z = intersects[0].object.position.z;
					indendedCameraPosition = getCameraPlacementForObject(intersects[0].object, 1200);
					cameraDummy.position.x = indendedCameraPosition.x;
					cameraDummy.position.y = indendedCameraPosition.y;
					cameraDummy.position.z = indendedCameraPosition.z;
					objectOfInterest = intersects[0].object;
					return;
				}
				var position = getOffsetPositionOnScreen(intersects[0]);
				var xPos = event.clientX - position.x + intersects[0].object.width / 2 * 0.75;
				var yPos = event.clientY - position.y + intersects[0].object.height / 2;

			}
		},
		mouseMove: function(event) {

			var multiplierX = event.clientX / window.innerWidth - 0.5;
			var multiplierY = event.clientY / window.innerHeight - 0.5;
			if (objectOfInterest) {
				cameraDummy.position.x = indendedCameraPosition.x + ((300 * multiplierX) * Math.cos(objectOfInterest.rotation.y)) - ((300 * multiplierY) * Math.sin(objectOfInterest.rotation.y));
				cameraDummy.position.y = indendedCameraPosition.y + (300 * multiplierY);
				cameraDummy.position.z = indendedCameraPosition.z + ((300 * multiplierX) * Math.sin(objectOfInterest.rotation.y)) + ((300 * multiplierY) * Math.cos(objectOfInterest.rotation.y));
			}
		},
		mouseClick: function(event) {},
		mouseUp: function() {
			document.removeEventListener('mousemove', callbacks.mouseMove, false);
		},
		guiClick: function() {
			var $this = $(this),
				varName = $this.data("guivar"),
				varVal = $this.data("guival");
			if (vars[varName] !== null) {
				vars[varName] = varVal;
			}
			$this.siblings().addClass('disabled');
			$this.removeClass('disabled');
			return false;
		},
		windowResize: function() {
			if (camera) {
				console.info($(container).height());
				width = $(container).width(), height = $(container).height(), camera.aspect = width / height, renderer.setSize(width, height);

				camera.updateProjectionMatrix();
			}
		},
		keyDown: function(event) {
			switch (event.keyCode) {
			case 39:
				// right
				selectedBlog++;
				isOrbiting = false;
				cameraTargetDummy.position.x = objects[selectedBlog].position.x;
				cameraTargetDummy.position.y = objects[selectedBlog].position.y;
				cameraTargetDummy.position.z = objects[selectedBlog].position.z;
				indendedCameraPosition = getCameraPlacementForObject(objects[selectedBlog], 1200);
				cameraDummy.position.x = indendedCameraPosition.x;
				cameraDummy.position.y = indendedCameraPosition.y;
				cameraDummy.position.z = indendedCameraPosition.z;
				objectOfInterest = objects[selectedBlog];
				break;
			case 37:
				// left
				selectedBlog--;
				isOrbiting = false;
				cameraTargetDummy.position.x = objects[selectedBlog].position.x;
				cameraTargetDummy.position.y = objects[selectedBlog].position.y;
				cameraTargetDummy.position.z = objects[selectedBlog].position.z;
				indendedCameraPosition = getCameraPlacementForObject(objects[selectedBlog], 1200);
				cameraDummy.position.x = indendedCameraPosition.x;
				cameraDummy.position.y = indendedCameraPosition.y;
				cameraDummy.position.z = indendedCameraPosition.z;
				objectOfInterest = objects[selectedBlog];
				break;
			case 27:
				Tree.Portfolio.setIsOrbiting(true);
				break;
			}

		}
	};
};


$(document).ready(function() {
	TWEEN.start();
	$.getJSON("http://blog.jeremyclewell.com/?json=get_recent_posts&post_type=portfolio_entry&callback=?", function(json) {
		for (var post in json["posts"]) {
			$.tmpl("blogTemplate", json["posts"][post]).appendTo("#blog");
		}

		//	setTimeout(function() {
		Tree.Portfolio.init();
		Tree.Portfolio.animate();
		Tree.Portfolio.updateBlogPosts();
		//	 }, 1000);
	})
});