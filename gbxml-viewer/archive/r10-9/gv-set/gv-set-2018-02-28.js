	var SET = {};


	initSettings();

	function initSettings() {

		if ( butSettings.style.backgroundColor !== 'var( --but-bg-color )' ) {


			SET.explodeStart = false;

			divMenuItems.innerHTML =

				'<details id=detSettings class=app-menu open >' +

					'<summary>Settings</summary>' +


					'<p>' +
						'toggles<br><button onclick=GBX.surfaceMeshes.visible=!GBX.surfaceMeshes.visible; >surfaces</button>' +
						' <button onclick=GBX.surfaceEdges.visible=!GBX.surfaceEdges.visible; >edges</button>' +
						' <button onclick=GBV.setAllVisible(); >all</button>' +
					'</p>' +


					'<p><button onclick=SET.setRandomMaterial(); >Set random material</button></p>' +

					'<p><button onclick=SET.setPhongDefaultMaterial(); >Set default phong material</button></p>' +

					'<p><button onclick=SET.setNormalMaterial(); >Set normal material</button></p>' +

					'<p><button onclick=SET.setDefaultMaterial(); >Set default material</button></p>' +

					'<p><button onclick=SET.setExposureMaterial(); >Set exposure type material</button></p>' +


					'<hr>' +

					'<p><button onclick=SET.toggleShadowMap(); >Toggle shadows</button></p>' +

					'<p><button onclick=SET.toggleBackgroundGradient(); > Toggle background gradient </button></p>' +

					'<p><button onclick=SET.toggleWireframe(); title="View all the triangles created by Three.js to display the geometry." > Toggle wireframe </button></p>' +

					'<p><button onclick=SET.toggleSurfaceNormals(); title="Every Three.js triangle has a normal. See them here." > Toggle surface normals </button></p>' +

					'<p><button onclick=SET.toggleAxesHelper(); >Toggle axes</button></p>' +

					'<p>' +
						'<button onclick=SET.toggleGridHelper(); >Toggle grid</button> ' +
						'<button onclick=SET.updateMeshLevel("gridHelper",+0.2); >+</button> ' +
						'<button onclick=SET.updateMeshLevel("gridHelper",-0.2); >-</button>' +
					'</p>' +

					'<p>' +
						'<button onclick=SET.toggleGroundHelper(); >Toggle ground</button> ' +
						'<button onclick=SET.updateMeshLevel("groundHelper",+0.2); >+</button> ' +
						'<button onclick=SET.updateMeshLevel("groundHelper",-0.2); >-</button>' +
					'</p>' +

					'<p><button onclick=SET.toggleSceneAutoRotate() title= "Stop the spinning!" > Toggle scene rotation </button></p>' +

					'<p><button onclick=SET.toggleCameraOrthoPerspective() title="" > Toggle camera ortho </button></p>' +

					'<p title="building opacity: 0 to 100%" >Opacity: ' +
						'<output id=outOpacity class=floatRight >85%</output>' +
						'<input type="range" id="rngOpacity" min=0 max=100 step=1 value=85 oninput=SET.updateOpacity(); >' +
					'</p>' +

					/*
					'<p title="building surface separation: 0 to 100%" >Explode view: ' +
						'<output id=outViewExplode class=floatRight >0%</output>' +
						'<input type="range" id="rngViewExplode" min=-50 max=50 step=1 value=0 onchange=SET.updateViewExplodeHorizontal(); >' +
					'</p>' +
					*/

					'<p title="building surface separation: 0 to 100%" >Explode view <br>' +
						'<button onclick=SET.explodeMinus();> minus </button>' +
						'<button onclick=SET.explodeReset(); >reset</button>' +
						'<button onclick=SET.explodePlus();> plus </button>' +
					'</p>' +


					'<hr>' +

				'</details>' +

				divMenuItems.innerHTML +

			'';

			// following causes error when inside an iframe in a read me
			//if ( parent.setIfrThree ) { setIfrThree(); }

			butSettings.style.backgroundColor = 'var( --but-bg-color )';

			const bbox = new THREE.Box3().setFromObject( GBX.surfaceMeshes );
			const sphere = bbox.getBoundingSphere();
			center = sphere.center;
			radius = sphere.radius;

			//console.log( 'center', center );
			//console.log( 'radius', radius );

		} else {

			detSettings.remove();

			butSettings.style.backgroundColor = '';

		}

	}



	SET.setRandomMaterial = () => {

		GBX.surfaceMeshes.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material = new THREE.MeshPhongMaterial( {
					color: 0xffffff * Math.random(),
					polygonOffset: false,
					polygonOffsetFactor: 10, // positive value pushes polygon further away
					polygonOffsetUnits: 1,
					side: 2,
					transparent: true
				} );

			}

		} );

	}



	SET.setPhongDefaultMaterial = () => {

		GBX.surfaceMeshes.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material = new THREE.MeshPhongMaterial( {
					side: 2,
					transparent: true
				} );

			}

		} );

	}



	SET.setNormalMaterial = () => {

		GBX.surfaceMeshes.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material = new THREE.MeshNormalMaterial( {
					side: 2,
					transparent: true
				} );

			}

		} );

	}



	SET.setDefaultMaterial = () => {

		GBX.surfaceMeshes.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material =
					new THREE.MeshPhongMaterial( { color: GBX.colors[ child.userData.data.surfaceType ], side: 2, opacity: 0.85, transparent: true } );

			}

		} );

	}



	SET.setExposureMaterial = () => {

		var colorsExposure = {

			InteriorWall: 0xff8080,
			ExteriorWall: 0x80ff80,
			Roof: 0x80ff80,
			InteriorFloor: 0xff8080,
			ExposedFloor: 0x80ff80,
			Shade: 0xffb480 ,
			UndergroundWall: 0xd06800,
			UndergroundSlab: 0xd06800,
			Ceiling: 0xff8080,
			Air: 0xffff80,
			UndergroundCeiling: 0xff8080,
			RaisedFloor: 0xff8080,
			SlabOnGrade: 0xd06800,
			FreestandingColumn: 0xff8080,
			EmbeddedColumn: 0xff8080

		}

		GBX.surfaceMeshes.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh
					&& ( SET.surfaceAdjacencyDuplicates === undefined || SET.surfaceAdjacencyDuplicates.includes( child.userData.data.Name ) === false )
					&& ( SET.surfaceAdjacencyInvalids === undefined || SET.surfaceAdjacencyInvalids.includes( child.userData.data.Name ) === false )
					&& ( SET.surfaceCoordinateDuplicates === undefined || SET.surfaceCoordinateDuplicates.includes( child.userData.data.Name ) === false )

			) {

				child.material =
					new THREE.MeshPhongMaterial( { color: colorsExposure[ child.userData.data.surfaceType ], side: 2, opacity: 0.85, transparent: true } );

			}

		} );

	}


/////////////////


	SET.toggleShadowMap = () => {

		THR.renderer.shadowMap.enabled = !THR.renderer.shadowMap.enabled;

		THR.scene.traverse( function ( child ) {

				//			if ( child.material ) {

				child.castShadow = !child.castShadow;
				child.receiveShadow = !child.receiveShadow;
				//				child.material.needsUpdate = true;

				//			}

		} );

	}



	SET.toggleBackgroundGradient = () => {

		// 2016-07-18

		var col = function() { return ( 0.5 + 0.5 * Math.random() ).toString( 16 ).slice( 2, 8 ); };
		var pt = function() { return ( Math.random() * window.innerWidth ).toFixed( 0 ); }
		var image = document.body.style.backgroundImage;

		document.body.style.backgroundImage = image ? '' : 'radial-gradient( circle farthest-corner at ' +
			pt() + 'px ' + pt() + 'px, #' + col() + ' 0%, #' + col() + ' 50%, #' + col() + ' 100% ) ';

	}



	SET.toggleWireframe = () => {

		THR.scene.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material.wireframe = !child.material.wireframe;

			}

		} );

	}



	SET.toggleSurfaceNormals = () => {

		let helperNormalsFaces = THR.scene.getObjectByName( 'helperNormalsFaces' );

		if ( helperNormalsFaces ) {

			THR.scene.remove( helperNormalsFaces );

		}

		if ( !helperNormalsFaces ) {

			helperNormalsFaces = new THREE.Group();

			GBX.surfaceMeshes.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh && child.visible ) {

					helperNormalsFace = new THREE.FaceNormalsHelper( child, 2, 0xff00ff, 3 );
					helperNormalsFaces.add( helperNormalsFace );

					helperNormalsFaces.visible = false;

				}

			} );

			helperNormalsFaces.name = 'helperNormalsFaces';
			THR.scene.add( helperNormalsFaces );
			helperNormalsFaces.visible = false;

		}

		helperNormalsFaces.visible = !helperNormalsFaces.visible;

	}



	SET.toggleAxesHelper = () => {

		THR.axesHelper.visible = !THR.axesHelper.visible;

	}



	SET.toggleGridHelper = () => {

		let meshGridHelper = GBX.surfaceMeshes.getObjectByName( 'gridHelper' );

		if ( !meshGridHelper) {

			const bbox = new THREE.Box3().setFromObject( GBX.surfaceMeshes );

			meshGridHelper = new THREE.GridHelper( 3 * GBX.surfaceMeshes.userData.radius, 20, 'green', 'lightgreen' );
			meshGridHelper.rotation.x = Math.PI / 2;
			meshGridHelper.position.set( THR.axesHelper.position.x, THR.axesHelper.position.y, bbox.min.z );
			meshGridHelper.name = 'gridHelper';
			GBX.surfaceMeshes.add( meshGridHelper );

			meshGridHelper.visible = false;

		}

		meshGridHelper.visible = !meshGridHelper.visible;

	}



	SET.toggleGroundHelper = () => {

		let meshGroundHelper = GBX.surfaceMeshes.getObjectByName( 'groundHelper' );

		if ( !meshGroundHelper ) {

			const bbox = new THREE.Box3().setFromObject( GBX.surfaceMeshes );

			const geometry = new THREE.BoxBufferGeometry( 3 * GBX.surfaceMeshes.userData.radius, 3 * GBX.surfaceMeshes.userData.radius, 1  );
			const material = new THREE.MeshPhongMaterial( { color: 'green', opacity: 0.85, transparent: true } );
			meshGroundHelper = new THREE.Mesh( geometry, material );
			meshGroundHelper.name = 'groundHelper';
			meshGroundHelper.receiveShadow = true;
			meshGroundHelper.position.set( THR.axesHelper.position.x, THR.axesHelper.position.y, bbox.min.z - 0.5 );

			GBX.surfaceMeshes.add( meshGroundHelper );

			meshGroundHelper.visible = false;

		}

		meshGroundHelper.visible = !meshGroundHelper.visible;

	}



	SET.toggleSceneAutoRotate = () => {

		THR.controls.autoRotate = !THR.controls.autoRotate;

	}



	SET.toggleCameraOrthoPerspective = () => {

		if ( SET.cameraOrtho === undefined ) {

			const width = 300; //surfaceMeshes.userData.radius > 10 ? 3 * surfaceMeshes.userData.radius : 200;
			const height = 300; // surfaceMeshes.userData.radius > 10 ? 3 * surfaceMeshes.userData.radius : 200; //; //  * surfaceMeshes.userData.radius;
			SET.cameraOrtho = new THREE.OrthographicCamera( width / -3, width / 3, height / 3, height / - 3, 1, 1000 );
			SET.cameraOrtho.up.set( 0, 0, 1 );
			THR.scene.add( SET.cameraOrtho );
			SET.controlsOrtho = new THREE.OrbitControls( SET.cameraOrtho, THR.renderer.domElement );

			THR.camera = SET.cameraOrtho;
			THR.camera.updateProjectionMatrix();
			THR.controls = SET.controlsOrtho;

			GBV.zoomObjectBoundingSphere( GBX.surfaceMeshes );

		} else {

			GBV.setAllVisible();
			GBV.zoomObjectBoundingSphere( GBX.surfaceMeshes );
			SET.cameraOrtho = undefined;

		}

	}



	SET.updateOpacity = () => {

		const opacity = parseInt( rngOpacity.value, 10 );
		outOpacity.value = opacity + '%';

		THR.scene.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material.opacity = opacity / 100;

			}

		} );


	}

/*
	SET.updateViewExplodeHorizontalOriginal = () => {

		const s = 1 + parseFloat( rngViewExplode.value ) / 500;

		THR.scene.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				if ( !child.userData.positionStart ) {

					child.userData.positionStart = child.position.clone();

				}

				const p = child.userData.positionStart;

				child.position.x = s * p.x;
				child.position.y = s * p.y;

			}

		} );

	}

*/

	SET.xxxupdateViewExplodeHorizontal = () => {

		const s = parseFloat( rngViewExplode.value ) / 3;

		GBX.surfaceEdges.visible = false;

		const bbox = new THREE.Box3().setFromObject( GBX.surfaceMeshes );
		const sphere = bbox.getBoundingSphere();
		center = sphere.center;
		radius = sphere.radius;

		//		console.log( 'center', center );
		//		console.log( 'radius', radius );

		/*
		const geometry = new THREE.BoxGeometry( 2, 2, 2 );
		const material = new THREE.MeshNormalMaterial();
		bmesh = new THREE.Mesh( geometry, material );
		bmesh.position.copy( center );
		scene.add( bmesh );
		//console.log( 'bmesh', bmesh );
		*/

		THR.scene.updateMatrixWorld();

		THR.scene.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.updateMatrixWorld();

				child.userData.positionStart1 = child.position.clone();

				if ( !child.userData.positionStart ) {

					if ( child.geometry.boundingSphere ) {

						const pp = child.geometry.boundingSphere.center.clone();
						pp.applyMatrix4( child.matrixWorld );
						child.userData.positionStart = pp;

						//const pp = child.clone();
						//child.userData.positionStart = pp.localToWorld( child.geometry.boundingSphere.center );

					} else {

						child.userData.positionStart = child.position.clone();

					}

					//var vector = child.position.clone();
					//vector.applyMatrix4( child.matrixWorld );
					//const vector = child.localToWorld( child.position.clone() );
					child.userData.vectorStart = child.userData.positionStart.clone().sub( center ).normalize();

				}

				const p = child.userData.positionStart.clone();
				const vec = child.userData.vectorStart.clone();

				/*
				const geometry = new THREE.BoxGeometry( 1, 1, 1 );
				const material = new THREE.MeshNormalMaterial();
				const amesh = new THREE.Mesh( geometry, material );
				amesh.position.copy( p );
				scene.add( amesh );

				let geometry2, material2, line;

				geometry2 = new THREE.Geometry();
				pp = p.clone().add( vec.multiplyScalar( 2 ) );
				//				console.log( 'pp', pp );
				geometry2.vertices = [ p, pp ];
				material2 = new THREE.LineBasicMaterial( { color: 0x000000 } );
				line = new THREE.Line( geometry2, material2 );
				scene.add( line );
				*/

				//				vv = new THREE.Vector3( 5, 0, 0 );
				child.position.add( vec.multiplyScalar( s ) );
				//				console.log( 's', s );
				//				child.position.copy( p );

			}

		} );

	}

	SET.explodeReset = () => {

		if ( SET.explodeStart === false ) { SET.explodeInit() };

		THR.scene.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.position.copy( child.userData.positionStart1 );

			}

		} );

		GBX.surfaceEdges.visible = true;

	}



	SET.explodeInit = () => {

		THR.scene.updateMatrixWorld();

		THR.scene.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.updateMatrixWorld();

				child.userData.positionStart1 = child.position.clone();

			}

		} );

		SET.explodeStart = true;

	}



	SET.explodePlus = () => {

		if ( SET.explodeStart === false ) { SET.explodeInit() };

		const s = 1;

		GBX.surfaceEdges.visible = false;

		const bbox = new THREE.Box3().setFromObject( GBX.surfaceMeshes );
		const sphere = bbox.getBoundingSphere();
		center = sphere.center;
		radius = sphere.radius;

		THR.scene.updateMatrixWorld();

		THR.scene.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.updateMatrixWorld();

				if ( !child.userData.positionStart ) {

					if ( child.geometry.boundingSphere ) {

						const pp = child.geometry.boundingSphere.center.clone();
						pp.applyMatrix4( child.matrixWorld );
						child.userData.positionStart = pp;

					} else {

						child.userData.positionStart = child.position.clone();

					}

					child.userData.vectorStart = child.userData.positionStart.clone().sub( center ).normalize();

				}

				const p = child.userData.positionStart.clone();
				const vec = child.userData.vectorStart.clone();

//				child.position.add( new THREE.Vector3( 1.2 * ( vec.x ), 1.2* ( vec.y ), 0 ) );
				child.position.add( vec.multiplyScalar( s ) );
			}

		} );

	}



	SET.explodeMinus = () => {

		const s = 1;

		if ( SET.explodeStart === false ) { SET.explodeInit() };

		GBX.surfaceEdges.visible = false;

		const bbox = new THREE.Box3().setFromObject( GBX.surfaceMeshes );
		const sphere = bbox.getBoundingSphere();
		center = sphere.center;
		radius = sphere.radius;

		THR.scene.updateMatrixWorld();

		THR.scene.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.updateMatrixWorld();

				if ( !child.userData.positionStart ) {

					if ( child.geometry.boundingSphere ) {

						const pp = child.geometry.boundingSphere.center.clone();
						pp.applyMatrix4( child.matrixWorld );
						child.userData.positionStart = pp;

					} else {

						child.userData.positionStart = child.position.clone();

					}

					child.userData.vectorStart = child.userData.positionStart.clone().sub( center ).normalize();

				}

				const p = child.userData.positionStart.clone();
				const vec = child.userData.vectorStart.clone();

				child.position.sub( vec.multiplyScalar( s ) );

			}

		} );

	}

	SET.updateViewExplodeVertical = () => {

		const sz = 1 + parseFloat( rngViewExplodeVertical.value ) / 10;

		GBX.surfaceMeshes.traverse( function ( child ) {

				if ( !child.userData.positionStart ) {

					child.userData.positionStart = child.position.clone();

				}

				const p = child.userData.positionStart;

				child.position.z = sz * p.z;

		} );

	}



	SET.updateMeshLevel = ( meshName, delta ) => {

		const mesh = GBX.surfaceMeshes.getObjectByName( meshName );

		if ( mesh ) {

			mesh.position.z += delta;

		}

	}



