/*global

THR, THREE, GBX, GBV, window, document,butSettings, detSettings,divMenuItems,rngOpacity,rngViewExplodeVertical

*/

	var HUD = {};

	var divHeadsUp;
	var intersected;
	var objects;
	var mouse;

	var telltalesVertex;
	var telltalesPolyloop;


	initHeadsUp();

	function initHeadsUp() {

		if ( butHeadsUp.style.backgroundColor !== 'var( --but-bg-color )' ) {

			if ( !divHeadsUp ) {

				divHeadsUp = document.body.appendChild( document.createElement( 'div' ) );
				divHeadsUp.style.cssText =
				`
					background-color: #f8f8f8; border-radius: 8px; display: none; left: calc( 100% - 400px );
					max-height: 97%; min-height: 100px; min-width: 200px; opacity: 0.95; overflow: auto;
					padding: 5px 5px 10px 10px; position: fixed; resize: both; top: 10px; z-index: 10;
				`;

				divHeadsUp.innerHTML =
				`
					<div id=divDraggableHeader2 title="Open JavaScript console to see more data" >
						click here to move
						<button onclick=divHeadsUp.style.display="none"; style=float:right;z-index:20; >&#x2716;</button>
					</div>
					<div id=divHUDheader ></div>
					<div id=divHUDItems ></div>
					<div id=divHUDfooter ></div>
				`;



				divDraggableHeader2.style.cssText =
					'background-color: indianred; color: #fff; cursor: move; padding: 10px; z-index: 10;';

				divDraggableHeader2.addEventListener( 'mousedown', COR.onMouseDownDraggable, false );

				divDraggableHeader2.addEventListener( 'touchstart', COR.onTouchStartDraggable, false );
				divDraggableHeader2.addEventListener( 'touchmove', COR.onTouchMoveDraggable, false );

				//window.addEventListener( 'mouseup', COR.onMouseUpDraggable, false ); //in COR

			}

			mouse = new THREE.Vector2();

			THR.renderer.domElement.addEventListener( 'click', onRendererMouseMoveHUD, false );
			THR.renderer.domElement.addEventListener( 'touchstart', onRendererTouchStartHUD, false );

			butHeadsUp.style.backgroundColor = 'var( --but-bg-color )';

		} else {

			toggleHeadsUpOff();

		}

	}



	function toggleHeadsUpOff() {

		if ( intersected && intersected.material.emissive ) { intersected.material.emissive.setHex( intersected.currentHex ); }
		if ( intersected ) { intersected.material.opacity = intersected.currentOpacity; }

		divHeadsUp.style.display = 'none';
		//divHeadsUp.innerHTML = '';

		THR.renderer.domElement.removeEventListener( 'click', onRendererMouseMoveHUD, false );
		THR.renderer.domElement.removeEventListener( 'click', onRendererMouseDownHUD, false );
		THR.renderer.domElement.removeEventListener( 'touchstart', onRendererTouchStartHUD, false );

		butHeadsUp.style.backgroundColor = '';

	}



	function onRendererMouseMoveHUD( event ) {

		//if ( butHeadsUp.style.backgroundColor !== 'var( --but-bg-color )' ) { return; }

		var raycaster;
		var intersects;

		event.preventDefault();

		if ( event.buttons > 0 ) { return; }

		mouse.x = ( event.clientX / THR.renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / THR.renderer.domElement.clientHeight ) * 2 + 1;

		raycaster = new THREE.Raycaster();
		raycaster.setFromCamera( mouse, THR.camera );

		intersects = raycaster.intersectObjects( GBX.surfaceMeshes.children );

		if ( intersects.length > 0 ) {

			if ( intersected != intersects[ 0 ].object ) {

				if ( intersected && intersected.material.emissive ) { intersected.material.emissive.setHex( intersected.currentHex ); }
				if ( intersected ) { intersected.material.opacity = intersected.currentOpacity; }

				intersected = intersects[ 0 ].object;

				console.log( 'intersected', intersected );

				if ( intersected.material.emissive ) {

					intersected.currentHex = intersected.material.emissive.getHex();
					intersected.material.emissive.setHex( 0xff0000 );

				}

				intersected.currentOpacity = intersected.material.opacity;
				intersected.material.opacity = 1;

				HUD.setHeadsUp( event );
			}

		} else {

			if ( intersected && intersected.material.emissive ) { intersected.material.emissive.setHex( intersected.currentHex ); }
			if ( intersected ) { intersected.material.opacity = intersected.currentOpacity; }

			intersected = undefined;

		}



	}



	function onRendererMouseDownHUD( event ) {

		//dragMouseDown;( event );
		divHeadsUp.style.display = 'none';

		THR.renderer.domElement.removeEventListener( 'click', onRendererMouseMoveHUD, false );

	}



	function onRendererTouchStartHUD( event ) {

		event.preventDefault();

		event.clientX = event.touches[0].clientX;
		event.clientY = event.touches[0].clientY;

		onRendererMouseMoveHUD( event );

	}



	HUD.setHeadsUp = function( event ) {
		var space1;
		var space2;

		if ( intersected === undefined ) {

			if ( event && event.type === 'touchstart' ) {

				divHeadsUp.style.display = 'none';

			}

			document.body.style.cursor = 'auto';

			return;

		}

		THR.controls.keys = false;
		divHeadsUp.style.display = '';

		const data = intersected.userData.data;
		HUD.data = data;
		//console.log( 'data', data );

		const b = '<br>';
		const height = parseFloat( data.RectangularGeometry.Height );
		const width = parseFloat( data.RectangularGeometry.Width );
		const surfaceArea = height * width;

		const headerTxt =
		`
			toggle the visible items<br>
			<button onclick=intersected.visible=!intersected.visible; accesskey="z" title = "key Z" >element</button>
			<button onclick=GBX.surfaceMeshes.visible=!GBX.surfaceMeshes.visible; accesskey="x" title = "key X" >surfaces</button>
			<button onclick=GBX.surfaceEdges.visible=!GBX.surfaceEdges.visible; accesskey="c" title = "key C"  >edges</button>
			<button onclick=GBV.setAllVisible(); accesskey="v" title = "key V" >all</button>
			<br>
			edit the surface<br>
			<button class=toggle onclick=GBV.deleteSurface("` + data.id + `"); >delete surface</button>
			<button onclick=GBV.addModifiedBy(); title='add name, app, date and time of the edits' >modified by </button>
			<button onclick=GBV.saveFile(); title="creates a new file with the changes" >save edits</button>
			<br><hr>

			<div class=flex-container2 >
				<div>
					<input oninput=HUD.updateSelect(this,selSurface); size=6 placeholder="surface id" ><br>
					<select id=selSurface onclick=HUD.updateSurface(this.value); onchange=HUD.updateSurface(this.value); size=8 >` + GBX.surfacesOptions + `</select><br>
					<button onclick=HUD.setHeadsUp(); >update</button>
				</div>
				<div style=margin-left:15px;overflow-x:auto;max-width:260px; >
					<b>surface</b><br>

					id <button onclick=GBV.showSurface(this.innerText)  >` + data.id + `</button>
					<button onclick=GBV.zoomIntoSurface("` + data.id + `"); >zoom</button>
					<br>`
					+ ( data.Name ? 'name <i>' + data.Name + '</i>' +b : '' ) +
					`type <button onclick=GBV.showSurfaceType(this.innerText);  >` + data.surfaceType + `</button>` +
					` edit <select id = "selType" onchange=HUD.updateType(this.value); >` + GBX.surfaceTypeOptions + `</select>
					<br>`
					+ ( data.CADObjectId ? 'cad object id <button onclick=GBV.showCadId("' +
						encodeURI( data.CADObjectId ) + `"); >` + data.CADObjectId + `</button><br>` : `` ) +
					`area <i>` + Number( surfaceArea ).toFixed( 1 ) + `</i>` +
						` ln <i>` + height.toFixed( 3 ) + `</i> wd <i>` + width.toFixed( 3 ) + `</i>` +
				`<div>
			</div>
		`;

		let adjacentsTxt = data.AdjacentSpaceId ? data.AdjacentSpaceId : '<hr>no adjacency';

		if ( adjacentsTxt !== '<hr>no adjacency' ) {

			if ( Array.isArray( adjacentsTxt ) === true ) {

				//console.log( 'adjacentsTxt', adjacentsTxt );

				space1 = GBV.getSpaceId( adjacentsTxt[ 0 ].spaceIdRef );
				space2 = GBV.getSpaceId( adjacentsTxt[ 1 ].spaceIdRef );
				//console.log( 'space1', space1 );

				if ( space1 && space2 ) {
					// make into function
					adjacentsTxt =
						'<hr><div class=flex-container2 >' +
							'<div >' +
								'<input oninput=HUD.updateSelect(this,selSpace1); size=6 placeholder="space 1 id" ><br>' +
								'<select id=selSpace1 onclick=GBV.showSpace(this.value); onchange=GBV.showSpace(this.value); size=8 >' + GBX.spacesOptions + '</select><br>' +
								'<button onclick=HUD.updateSpace(1); >update</button>' + b +
							'</div>' +
							'<div style=margin-left:15px;overflow-x:auto;max-width:270px; >' +
								'<b>adjacent space 1</b> ' + b +
								'id <button id=butSpace1 onclick=GBV.showSpace(this.innerText);selSpace1.value=this.innerText; >' + space1.id + '</button> ' + b +
								( space1.Name ? 'name <i>' + space1.Name + '</i>' + b : '' ) +
								( space1.Description ? 'description <i>' + encodeURI( space1.Description ) + '</i>' +b : '' ) +
								( space1.Area ? 'area <i>' + Number( space1.Area ).toFixed( 1 ) : '' ) +
								( space1.Volume ? '</i> volume </i>' + Number( space1.Volume ).toFixed( 1 ) + '</i>' + b : '' ) +
								( space1.conditionType ? 'condition type <i>' + space1.conditionType + '</i>' + b : '' ) +
								( space1.zoneIdRef ? 'zone id ref <i>' + space1.zoneIdRef + '</i>' + b : '' ) +
								'storey <button onclick=GBV.showStorey(this.innerText); >' + space1.buildingStoreyIdRef + '</button>' + b +
								( space1.CADObjectId ? 'cad object id <i>' + space1.CADObjectId + '</i>' + b : '' ) +
							'</div>' +
						'</div>' +
						'<hr>' +

						'<div class=flex-container2 >' +
							'<div >' +
								'<input oninput=HUD.updateSelect(this,selSpace2); size=6  placeholder="space 2 id" ><br>' +
								'<select id=selSpace2 onclick=GBV.showSpace(this.value); onchange=GBV.showSpace(this.value); size=8 >' + GBX.spacesOptions + '</select><br>' +
								'<button onclick=HUD.updateSpace(2); >update</button>' + b +
								'</div>' +
							'<div style=margin-left:15px;overflow-x:auto;max-width:270px; >' +
								'<b>adjacent space 2</b> ' + b +
								'id <button id=butSpace2 onclick=GBV.showSpace(this.innerText);selSpace2.value=this.innerText; >' + space2.id + '</button> ' + b +
								( space2.Name ? 'name <i>' + space2.Name + '</i>' + b : '' ) +
								( space2.Description ? 'description <i>' + encodeURI( space2.Description ) + '</i>' + b : '' ) +
								( space2.Area ? 'area <i>' + Number( space2.Area ).toFixed( 1 ) : '' ) + '</i>' +
								( space2.Volume ? ' volume <i>' + Number( space2.Volume ).toFixed( 1 ) + '</i>' + b : '' ) +
								( space2.conditionType ? 'condition type <i>' + space2.conditionType + '</i>' + b : '' ) +
								( space2.zoneIdRef ? 'zone id ref <i>' + space2.zoneIdRef + '</i>' + b : '' ) +
								'storey <button onclick=GBV.showStorey(this.innerText); >' + space2.buildingStoreyIdRef + '</button>' + b +
								( space2.CADObjectId ? 'cad object id <i>' + space2.CADObjectId + '</i>' + b : '' ) +
							'</div>' +
						'</div>';

				} else {

					adjacentsTxt = 'adjacencies: ' + data.AdjacentSpaceId[ 0 ] + ' ' + data.AdjacentSpaceId[ 1 ];

				}

			} else {

				console.log( 'data.AdjacentSpaceId.spaceIdRef', data.AdjacentSpaceId.spaceIdRef );
				//console.log( 'adjacentsTxt', adjacentsTxt );
				//console.log( 'hud AdjacentSpaceId', data.AdjacentSpaceId );

				space1 = GBV.getSpaceId( data.AdjacentSpaceId.spaceIdRef );
				console.log( 'hud space1', space1 );

				if ( !space1 ) { return; }


				adjacentsTxt =
					'<hr><div class=flex-container2 >' +
						'<div >' +
							'<input oninput=HUD.updateSelect(this,selSpace1); size=6 placeholder="space id" ><br>' +
							'<select id=selSpace1 onclick=GBV.showSpace(this.value); onchange=GBV.showSpace(this.value); size=10 >' + GBX.spacesOptions + '</select><br>' +
							'<button onclick=HUD.updateSpace(0); >update</button>' + b +
							'</div>' +
						'<div style=margin-left:15px;overflow-x:auto;max-width:270px; >' +
							'<b>adjacent space 1</b> ' + b +
							'id <button id=butSpace0 onclick=GBV.showSpace(this.innerText);selSpace1.value=this.innerText; >' + space1.id + '</button> ' + b +
							( space1.Name ? 'name <i>' + space1.Name +  '</i>' + b : '' ) +
							( space1.Description ? 'description <i>' + encodeURI( space1.Description ) +  '</i>' +b : '' ) +
							( space1.Area ? 'area <i>' + Number( space1.Area ).toFixed( 1 ) + '</i>' : '' ) +
							( space1.Volume ? ' volume <i>' + Number( space1.Volume ).toFixed( 1 ) + '</i>' + b : '' ) +
							'storey <button onclick=GBV.showStorey(this.innerText); >' + space1.buildingStoreyIdRef + '</button>' + b +
							( space1.conditionType ? 'condition type <i>' + space1.conditionType + '</i>' + b : '' )  +
							( space1.zoneIdRef ? 'zone id <i>' + space1.zoneIdRef + '</i>' + b : '' ) +
							( space1.CADObjectId ? 'cad object id <i>' + space1.CADObjectId + '</i>' + b : '' ) +
						'</div>' +
					'</div>';

			}

		}

		const footerTxt =
		`
			<hr>
			For debug: <button onclick=HUD.displayTelltalesVertex(); title="Three.js data" >vertex telltales</button>
			<button onclick=HUD.displayTelltalesPolyloop(); title="gbXML data" >polyloop telltales</button>
		`;

		divHUDheader.innerHTML = headerTxt;
		divHUDItems.innerHTML = adjacentsTxt;
		divHUDfooter.innerHTML = footerTxt;

		selType.value = data.surfaceType;
		selSurface.value = data.id;
		if ( window.selSpace1 ) { selSpace1.value = space1.id; }
		if ( window.selSpace2 ) { selSpace2.value = space2.id; }

		document.body.style.cursor = 'pointer';

	};



	HUD.updateSurface = function( id ) {

		GBX.surfaceMeshes.children.forEach( function( element ) { element.visible = element.userData.data.id === id ? true : false; } );

		const surfaceMesh = GBX.surfaceMeshes.children.find( ( element ) => element.userData.data.id === id );
		intersected = surfaceMesh;

	};



	HUD.updateSpace = function( spaceRef ) {
		//console.log( 'spaceRef', spaceRef );

		const surfaceJson = HUD.data;
		const surfaceId = surfaceJson.id;
		let adjacentNew;

		HUD.surfacesXml = GBX.gbxmlResponseXML.getElementsByTagName("Surface");

		const surfaceXml = HUD.surfacesXml[ surfaceJson.id ];

		if ( spaceRef === 0  ) {

			const spaceId = selSpace1.value;
			surfaceJson.AdjacentSpaceId.spaceIdRef = spaceId;
			butSpace0.innerText = spaceId;

			adjacentNew = GBX.gbxmlResponseXML.createElement( "AdjacentSpaceId" );
			adjacentNew.setAttribute( "spaceIdRef", "none" );
			surfaceXml.appendChild( adjacentNew );

		} else if ( spaceRef === 1 ) {

			const spaceId = selSpace1.value;
			console.log( 'spaceId', spaceId );
			surfaceJson.AdjacentSpaceId[ 0 ].spaceIdRef = spaceId;
			butSpace1.innerText = spaceId;

			adjacentNew = GBX.gbxmlResponseXML.createElement( "AdjacentSpaceId" );
			adjacentNew.setAttribute( "spaceIdRef", spaceId );
			surfaceXml.appendChild( adjacentNew );

		} else if ( spaceRef === 2 ) {

			const spaceId = selSpace2.value;
			surfaceJson.AdjacentSpaceId[ 1 ].spaceIdRef = spaceId;
			butSpace2.innerText = spaceId;

			adjacentNew = GBX.gbxmlResponseXML.createElement( "AdjacentSpaceId" );
			adjacentNew.setAttribute( "spaceIdRef", spaceId );
			surfaceXml.appendChild( adjacentNew );

		}

		//console.log( 'surfaceXml', surfaceXml);
		//console.log( 'adjacentNew', adjacentNew );

		console.log( 'surfaceJson', surfaceJson );

		HUD.setHeadsUp();

	};



	HUD.updateType = function() {

		// console.log( 'id', HUD.data );

		const surface = HUD.data;
		//console.log( 'surface', surface );

		const id = surface.id;
		const spaceIdPrev = surface.AdjacentSpaceId;
		console.log( 'spaceIdPrev', spaceIdPrev );

		const typeNew = surface.surfaceType = selType.value;
		console.log( 'typeNew', typeNew );

		HUD.surfacesXml = GBX.gbxml.getElementsByTagName("Surface");

		surfaceXml = HUD.surfacesXml[ id ];
		//console.log( 'surfaceXml',  surfaceXml );

		surfaceXml.attributes.getNamedItem( 'surfaceType' ).nodeValue = typeNew;

		surfaceMesh = GBX.surfaceMeshes.children.find( ( element ) => element.userData.data.id === id );
		surfaceMesh.material.color.setHex( GBX.colors[ typeNew ] );
		surfaceMesh.material.needsUpdate = true;

		surfaceJson = surfaceMesh.userData.data;

		const types = ['InteriorWall', 'InteriorFloor', 'Ceiling', 'Air', 'UndergroundCeiling', 'RaisedFloor'];

		if ( typeNew === 'Shade' ) {

			delete surfaceJson.AdjacentSpaceId;

			const spaceId = surfaceXml.getElementsByTagName("AdjacentSpaceId")[0];
			//console.log( 'spaceId',  spaceId);

			const removed = surfaceXml.removeChild( spaceId );
			console.log( '0/123 removed', removed.nodeName );

		} else if ( types.includes( typeNew ) ) {  // type new is two adjacents

			console.log( 'typeNew', typeNew );

//			surfaceJson.AdjacentSpaceId= [];
//			adjacentSpaceId = surfaceJson.AdjacentSpaceId;
//			adjacentSpaceId[ 0 ] = { spaceIdRef: 'none' };
//			adjacentSpaceId[ 1 ] = { spaceIdRef: 'none' };

			if ( Array.isArray( spaceIdPrev ) === true ) { // type prev is two adjacents

				// leave things untouched
				console.log( '2/2spaceIdPrev',  spaceIdPrev );

			} else if ( spaceIdPrev ) { // type prev is single adjacent

				//surfaceJson.AdjacentSpaceId = spaceIdPrev; //{ spaceIdRef: spaceIdPrev };

				surfaceJson.AdjacentSpaceId= [];
				adjacentSpaceId = surfaceJson.AdjacentSpaceId;
				adjacentSpaceId[ 0 ] = { spaceIdRef: 'spaceIdPrev' };
				adjacentSpaceId[ 1 ] = { spaceIdRef: 'none' };

				spaceId = surfaceXml.getElementsByTagName("AdjacentSpaceId");
				console.log( '2/1 spaceId',  spaceId);

				const spaceId = surfaceXml.getElementsByTagName("AdjacentSpaceId")[1];
				//console.log( 'spaceId',  spaceId);
				const removed = surfaceXml.removeChild(spaceId);
				console.log( 'removed', removed.nodeName );

			} else { // type prev is no adjacent

				surfaceJson.AdjacentSpaceId = { spaceIdRef: 'none' };
				console.log( '2/0 no spaceIdPrev',  spaceIdPrev );

			}

		} else { // type new is single adjacent

			if ( Array.isArray( spaceIdPrev ) === true ) { // type prev is two adjacents

				console.log( 'spaceIdPrev',spaceIdPrev[ 0 ] );
				surfaceJson.AdjacentSpaceId = { spaceIdRef: spaceIdPrev[ 0 ] };

				adjacentXml = surfaceXml.getElementsByTagName("AdjacentSpaceId")[ 1 ];
				const removed = surfaceXml.removeChild( adjacentXml);
				adjacentXml = surfaceXml.getElementsByTagName("AdjacentSpaceId")[ 0 ];
				const removed2 = surfaceXml.removeChild( adjacentXml);

				const newAdj = GBX.gbxmlResponseXML.createElement( "AdjacentSpaceId" );
				newAdj.setAttribute( "spaceIdRef", spaceIdPrev[ 0 ].spaceIdRef ) ;
				xx = surfaceXml.appendChild( newAdj );
				console.log( 'xx', xx );

			} else if ( spaceIdPrev ) { // type prev is single adjacent

				// leave things untouched
				//surfaceJson.AdjacentSpaceId = spaceIdPrev; //{ spaceIdRef: spaceIdPrev };
				spaceId = surfaceXml.getElementsByTagName("AdjacentSpaceId")[0];
				console.log( '1/1 no changes spaceId',  spaceId);

			} else { // type prev is no adjacent

				surfaceJson.AdjacentSpaceId = { spaceIdRef: 'none' };
				console.log( '1/0 no spaceIdPrev',  spaceIdPrev );

			}

		}

		console.log( 'surfaceXml',  surfaceXml );

		//console.log( 'type surfaceJson', surfaceJson );

		HUD.setHeadsUp();

	};

/*

shade to shade OK
shade to one adjacent: OK

*/



	HUD.updateSelect = function( input, select ) {

		const str = input.value.toLowerCase();

		for ( let option of select.options ) {

			if ( option.value.toLowerCase().includes( str ) ) {

				select.value = option.value;

				break;

			}

		}

	};


/////////

	HUD.displayTelltalesVertex = function() {

		THR.scene.remove( telltalesVertex );

		if( !intersected ) { return; }

		telltalesVertex = new THREE.Object3D();


		const vertices = intersected.geometry.vertices;

		for ( let i = 0; i < vertices.length; i++ ) {

			const vertex = vertices[ i ];
			const geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
			geometry.applyMatrix( new THREE.Matrix4().makeTranslation( vertex.x, vertex.y, vertex.z ) );
			const material = new THREE.MeshNormalMaterial();
			const mesh = new THREE.Mesh( geometry, material );
			mesh.position.copy( intersected.position );
			mesh.quaternion.copy( intersected.quaternion );

			placard = HUD.drawPlacard( i.toString(), 0.01, 120, vertex.x, vertex.y, vertex.z + 0.5 );
			placard.position.copy( intersected.position );
			placard.quaternion.copy( intersected.quaternion );

			// console.log( 'placard', placard );
			telltalesVertex.add( placard );
			telltalesVertex.add( mesh );

		}

		THR.scene.add( telltalesVertex );

	};



	HUD.displayTelltalesPolyloop = function() {

		THR.scene.remove( telltalesPolyloop );

		if( !intersected ) { return; }

		telltalesPolyloop = new THREE.Object3D();

		const vertices = intersected.userData.data.PlanarGeometry.PolyLoop.CartesianPoint;

		for ( let i = 0; i < vertices.length; i++ ) {

			const vertex = vertices[ i ].Coordinate;
			const geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
			const material = new THREE.MeshNormalMaterial();
			const mesh = new THREE.Mesh( geometry, material );
			// console.log( 'vertex', vertex );

			mesh.position.set( parseFloat( vertex[ 0 ] ), parseFloat( vertex[ 1 ] ), parseFloat( vertex[ 2 ] ) );

			placard = HUD.drawPlacard( i.toString(), 0.01, 200, parseFloat( vertex[ 0 ] ) + 0.5, parseFloat( vertex[ 1 ] ) + 0.5, parseFloat( vertex[ 2 ] ) + 0.5 );
			// console.log( 'placard', placard );
			telltalesPolyloop.add( placard );
			telltalesPolyloop.add( mesh );

		}

		const openings = intersected.userData.data.Opening ? intersected.userData.data.Opening : [];

		for ( let i = 0; i < openings.length; i++ ) {

			const opening = openings[ i ]
			//console.log( 'opening', opening );

			const vertices = opening.PlanarGeometry.PolyLoop.CartesianPoint;
			//console.log( 'vertices', vertices );

			for ( let i = 0; i < vertices.length; i++ ) {

				const vertex = vertices[ i ].Coordinate;
				const geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
				const material = new THREE.MeshNormalMaterial();
				const mesh = new THREE.Mesh( geometry, material );
				// console.log( 'vertex', vertex );

				mesh.position.set( parseFloat( vertex[ 0 ] ), parseFloat( vertex[ 1 ] ), parseFloat( vertex[ 2 ] ) );

				placard = drawPlacard( i.toString(), 0.01, 10, parseFloat( vertex[ 0 ] ) + 0.5, parseFloat( vertex[ 1 ] ) + 0.5, parseFloat( vertex[ 2 ] ) + 0.5 );
				// console.log( 'placard', placard );
				telltalesPolyloop.add( placard );
				telltalesPolyloop.add( mesh );

			}


		}

		THR.scene.add( telltalesPolyloop );

	};



	HUD.drawPlacard = function( text, scale, color, x, y, z ) {

		// 2016-02-27 ~ https://github.com/jaanga/jaanga.github.io/tree/master/cookbook-threejs/examples/placards

		var placard = new THREE.Object3D();
		var v = function( x, y, z ){ return new THREE.Vector3( x, y, z ); };

		var texture = canvasMultilineText( text, { backgroundColor: color }   );
		var spriteMaterial = new THREE.SpriteMaterial( { map: texture, opacity: 0.9, transparent: true } );
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.position.set( x, y, z ) ;
		sprite.scale.set( scale * texture.image.width, scale * texture.image.height );

		var geometry = new THREE.Geometry();
		geometry.vertices = [ v( 0, 0, 0 ),  v( x, y, z ) ];
		var material = new THREE.LineBasicMaterial( { color: 0xaaaaaa } );
		var line = new THREE.Line( geometry, material );

		//placard.add( sprite, line );
		placard.add( sprite );
		return placard;


		function canvasMultilineText( textArray, parameters ) {

			var parameters = parameters || {} ;

			var canvas = document.createElement( 'canvas' );
			var context = canvas.getContext( '2d' );
			var width = parameters.width ? parameters.width : 0;
			var font = parameters.font ? parameters.font : '48px monospace';
			var color = parameters.backgroundColor ? parameters.backgroundColor : 120 ;

			if ( typeof textArray === 'string' ) textArray = [ textArray ];

			context.font = font;

			for ( var i = 0; i < textArray.length; i++) {

				width = context.measureText( textArray[ i ] ).width > width ? context.measureText( textArray[ i ] ).width : width;

			}

			canvas.width = width + 20;
			canvas.height =  parameters.height ? parameters.height : textArray.length * 60;

			context.fillStyle = 'hsl( ' + color + ', 80%, 50% )' ;
			context.fillRect( 0, 0, canvas.width, canvas.height);

			context.lineWidth = 1 ;
			context.strokeStyle = '#000';
			context.strokeRect( 0, 0, canvas.width, canvas.height );

			context.fillStyle = '#000' ;
			context.font = font;

			for ( i = 0; i < textArray.length; i++) {

				context.fillText( textArray[ i ], 10, 48  + i * 60 );

			}

			var texture = new THREE.Texture( canvas );
			texture.minFilter = texture.magFilter = THREE.NearestFilter;
			texture.needsUpdate = true;

			return texture;

		}

	};


