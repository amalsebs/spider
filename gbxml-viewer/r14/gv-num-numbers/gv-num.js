	// Copyright 2018 Ladybug Tools authors. MIT License
	/*global THR, THREE, GBX, THR */
	/* jshint esversion: 6 */

	// area by surface type / total floor: display surfaces  is broken
	// needs a cleanup / streamlining / going from gets to sets

	var NUM = {};

	NUM.initNumbers = function () { // called from bottom of file

		NUM.setMenuItems( CORdivMenuItems );

		COR.setPanelButtonInit( CORbutMenuNumbers );

	};


	NUM.setMenuItems = function( target ) {

		target.innerHTML =

		`<details id = "NUMdetNumbers" open>

			<summary>Numbers &nbsp; <a href=#../gv-num-numbers/README.md>?</a></summary>

			<div id = "NUMdivMenuPanelPrelims" ></div>

			<div id = "NUMdivStoreyAreas" ></div>

			<div id = "NUMdivSurfaceTypeAreas" ></div>

			<div id = "NUMdivOpeningAreas" ></div>

			<div id = "NUMdivExteriorAreas" ></div>

			<div id = "NUMdivOrientationAreas" ></div>

			<p><small>All quantities shown in this panel are calculated on-the-fly from the coordinate data in the gbXML file</small></p>

			<hr>

		</details>`;

		NUM.setAreasByStorey( NUMdivStoreyAreas );

		// following still to be updated

		//NUMdivSurfaceTypeAreas.innerHTML = NUM.getAreaBySurfaceType();
		NUM.setAreaBySurfaceType( NUMdivSurfaceTypeAreas );

		NUM.setAreaByOpeningType( NUMdivOpeningAreas );

		NUM.setAreaByExteriorSurfaces( NUMdivExteriorAreas );

		NUM.setOrientationAreas( NUMdivOrientationAreas );

	};



	NUM.getPanelVisibilityToggle = function() {

		const txt =

		`<details open >

			<summary>Visibility Toggles</summary>

			<button class="w3-theme-d1 w3-hover-theme w3-hover-border-theme" onclick=GBX.surfaceMeshes.visible=!GBX.surfaceMeshes.visible; >surfaces</button>
				<button class="w3-theme-d1 w3-hover-theme w3-hover-border-theme" onclick=GBX.surfaceEdges.visible=!GBX.surfaceEdges.visible; >edges</button>
				<button class="w3-theme-d1 w3-hover-theme w3-hover-border-theme" onclick=GBX.surfaceOpenings.visible=!GBX.surfaceOpenings.visible; title="toggle the windows" >openings</button>
				<button class="w3-theme-d1 w3-hover-theme w3-hover-border-theme" onclick=GBX.setAllVisible(); >all visible</button>

			<hr>

		</details>`;

		return txt;

	};



	/////

	NUM.setAreasByStorey = function( target ) {

		GBX.surfaceOpenings.visible = false;

		let storeys = GBX.gbjson.Campus.Building.BuildingStorey;

		if ( !storeys ) { NUMdivStoreys.innerHTML = 'No storey data'; return; }

		storeys = Array.isArray( storeys ) ? storeys : [ storeys ];

		NUM.storeys = [];

		for ( let i = 0; i < storeys.length; i++ ) {

			NUM.storeys.push( storeys[ i ] );

		}

		NUM.storeys.sort();

		target.innerHTML =

		`<details>

			<summary id = "NUMsumAreasByStorey" >Areas by Storey &raquo; ${NUM.storeys.length} found</summary>

			<p><small>Surface areas of floors</small></p>

			<div id=NUMdivAreasByStorey ></div>

			<p>
				<button onclick=NUM.showFloorSlab(NUMselAreasByStorey.value); title="area this slab" >get area of slab</button>

				<span id=NUMspnArea ></span>
			</p>

			<hr>

		</details>`;

		let item = {};
		item.attribute = 'idAreasByStorey';
		item.divAttributes = 'NUMdivAreasByStoreyAtts';
		item.divTarget = document.getElementById( 'NUMdivAreasByStorey' );
		item.element = 'Storey';
		item.name = 'itemAreasByStorey';
		item.optionValues = NUM.storeys.map( item => [ item.id, item.Name, item.Level ] );
		item.parent = GBX.gbjson.Campus.Building.BuildingStorey;
		item.placeholder = 'storey name';
		item.selItem = 'NUMselAreasByStorey';

		SEL.itemAdjacentSpaceInvalid = SEL.getElementPanel( item );
		NUMselAreasByStorey.selectedIndex = 0;
		//NUMselAreasByStorey.click();


	};



	NUM.showFloorSlab = function( storeyId ) {

		//console.log( 'id', id );

		GBX.surfaceOpenings.visible = false;

		const spaces = GBX.gbjson.Campus.Building.Space;

		const types = [ 'Ceiling', 'InteriorFloor', 'SlabOnGrade', 'RaisedFloor', 'UndergroundSlab' ];

		GBX.surfaceMeshes.children.forEach( element => element.visible = false );

		for ( let child of GBX.surfaceMeshes.children ) {

			const adjacentSpaceId = child.userData.data.AdjacentSpaceId;

			if ( !adjacentSpaceId ) { continue; }

			const spaceIdRef = Array.isArray( adjacentSpaceId ) ? adjacentSpaceId[ 1 ].spaceIdRef : adjacentSpaceId.spaceIdRef;

			spaces.forEach( element => { child.visible = element.id === spaceIdRef &&
				element.buildingStoreyIdRef === storeyId  && types.includes( child.userData.data.surfaceType )  ? true : child.visible;

			} );

		}

		NUM.floorSlabs = GBX.surfaceMeshes.children.filter( child => child.visible === true );
		//console.log( 'GBV.floorSlabs', GBV.floorSlabs);

		NUMspnArea.innerHTML = 'area: ' + NUM.getSurfacesAreaByArrayOfSurfaces( NUM.floorSlabs ).toLocaleString();

	};



	/////

	NUM.setAreaBySurfaceType = function( target ) {

		const surfaces = GBX.gbjson.Campus.Surface;

		let txt = '';
		const types = [];
		const typesCount = [];

		for ( let surfaceType of GBX.surfaceTypes ) {

			NUM[ 'surfaces' + surfaceType + 'Area' ] =  0;

		}

		for ( let surface of surfaces ) {

			const index = types.indexOf( surface.surfaceType );

			if ( index < 0 ) {

				types.push( surface.surfaceType );
				typesCount[ types.length - 1 ] = 1;


			} else {

				typesCount[ index ] ++;

			}

		}


		for ( let i = 0; i < types.length; i++ ) {

			let color =  GBX.colorsDefault[types[ i ]] ?  GBX.colorsDefault[types[ i ]].toString( 16 ) : '';
			color = color.length > 4 ? color : '00' + color;
			//console.log( 'col', color );

			const area = Math.round( NUM.getSurfacesArea( types[ i ] ) ).toLocaleString();
			//console.log( 'area', area );

			txt +=
			` <button
				 class=toggle onclick=SEL.setSurfaceTypeVisible(this.innerText);
				 style="width:8rem;background-color:#` + color + ` !important;" >` + types[ i ] +
					`</button> area: ` +
				area +
			`<br>`;

		}

		const tfa =
			NUM.surfacesInteriorFloorArea +
			NUM.surfacesSlabOnGradeArea +
			NUM.surfacesRaisedFloorArea +
			NUM.surfacesUndergroundSlabArea;

		var surfaceTypes = ["InteriorFloor","RaisedFloor","SlabOnGrade","UndergroundSlab"];

		target.innerHTML =

		`<details>

			<summary >Areas by Surface Type</summary>

			<p>Areas here are surface areas.</p>` +

			txt +

			`<p>
				<button style=width:8rem; onclick=NUM.showBySurfaceTypeArray(${surfaceTypes}); >Total floor</button>  area: ` +
					Math.round( tfa ).toLocaleString() + `</p>

			<hr>
		</details>`;

	};


	/////

	NUM.setAreaByOpeningType = function( target ) {

		// !! numbers differ with GBX.openings !!


		NUM.SurfacesWithOpenings = GBX.surfacesJson.filter( element => element.Opening );
		//console.log( 'NUM.SurfacesWithOpenings', NUM.SurfacesWithOpenings );

		NUM.openingsJson = [];

		for ( let surface of NUM.SurfacesWithOpenings ) {

			if ( surface.Opening.length ) {

				NUM.openingsJson.push ( ...surface.Opening );

			} else {

				NUM.openingsJson.push ( surface.Opening );

			}

			//if ( surface.Opening.length ) { console.log( 'surface.Opening.length', surface.Opening.length ); }

		}

		//console.log( 'NUM.openingsJson', NUM.openingsJson );


		let txt = '';
		const types = [];
		const typesCount = [];

		for ( let opening of GBX.surfaceOpenings.children ) {

			index = types.indexOf( opening.userData.data.openingType );

			if ( index < 0 ) {

				types.push( opening.userData.data.openingType );
				typesCount[ types.length - 1 ] = 1;

			} else {

				typesCount[ index ] ++;

			}

		}

		//console.log( 'types', types );

		let areaTotal = 0;
		let countTotal = 0;

		for ( let i = 0; i < types.length; i++ ) {

			const area = NUM.getAreaOpeningTypes( types[ i ] );
			txt +=
				` <button style=width:8rem; class=toggle onclick=SEL.setOpeningTypeVisible(this.innerText); >
					${ types[ i ] }
					</button> area: ` + Math.round( area ).toLocaleString() +
					` count: ` + typesCount[ i ] +
				`<br>`;

			areaTotal += area;
			countTotal += typesCount[ i ];

		}

		target.innerHTML =

		`<details>
			<summary >Areas by Opening Type</summary>
			<p>`+
				txt +
			`</p>
			<div><button style=width:8rem; onclick=SEL.setOpeningTypeVisible(); >
				Total openings</button> area: ` + Math.round( areaTotal ).toLocaleString() +
				` count: ` + countTotal +
				`<br>
			<div>
			<hr>
		</details>`;

	};



	NUM.getAreaOpeningTypes = function( type ) {

		let areaTotal = 0;

		const openings = NUM.openingsJson.filter( element => element.openingType === type );

		for ( let opening of openings ) {
			//console.log( 'undergroundWall', undergroundWall.PlanarGeometry.PolyLoop );

			const points = opening.PlanarGeometry.PolyLoop.CartesianPoint.map( CartesianPoint => new THREE.Vector3().fromArray( CartesianPoint.Coordinate ) );
			//console.log( 'points', points );

			//const triangle = NUM.getTriangle( points );
			const triangle = GBX.getPlane( points );
			//console.log( 'triangle', triangle );
			if ( !triangle ) { console.log( 'opening error', opening ); continue; }

			//console.log( 'triangle,normal', triangle.normal() );

			const obj = new THREE.Object3D();
			obj.lookAt( triangle.normal );  // copy the rotation of the triangle
			obj.quaternion.conjugate();
			obj.updateMatrixWorld();

			points.map( point => obj.localToWorld( point ) );
			//console.log( 'points', points );

			const area = THREE.ShapeUtils.area( points );
			areaTotal += area;
			//console.log( 'area', THREE.ShapeUtils.area( points ) );

			//surface.area = area;

		}

		NUM[ 'openings' + type + 'Area' ] = areaTotal;
		return areaTotal;

	};


	/////

	NUM.setAreaByExteriorSurfaces = function( target ) {

		const tesa = NUM.surfacesExteriorWallArea + NUM.surfacesRoofArea +
			NUM.surfacesExposedFloorArea + NUM.surfacesSlabOnGradeArea + NUM.surfacesUndergroundSlabArea +
			NUM.surfacesUndergroundWallArea;

		// array of types must be embedded , use double quotes and have no spaces

		target.innerHTML =

		`<details>
			<summary >Areas by Exterior Surface</summary>
			<p>
				<button style=width:8rem;
					onclick=NUM.showBySurfaceTypeArray(["ExteriorWall","Roof","ExposedFloor","SlabOnGrade","UndergroundSlab","UndergroundWall"]); >
					Exterior surfaces</button> area: ` +
					Math.round( tesa ).toLocaleString() +
			`</p>

			<p>
				<button class=toggle onclick=SEL.setExposedToSunVisible(); >Exposed to Sun</button>
			</p>

			<hr>
		</details>`;

	};



	NUM.getSurfacesArea = function( type ) {

		let areaTotal = 0;
		const surfaces = GBX.surfacesJson.filter( element => element.surfaceType === type );

		for ( let surface of surfaces ) {
			//console.log( 'undergroundWall', undergroundWall.PlanarGeometry.PolyLoop );

			const points = surface.PlanarGeometry.PolyLoop.CartesianPoint
				.map( CartesianPoint => new THREE.Vector3().fromArray( CartesianPoint.Coordinate ) );
			//console.log( 'points', points );

			// // Move to getTriangle??

			//const triangle = NUM.getTriangle( points );
			const triangle = GBX.getPlane( points );
			//console.log( 'triangle', triangle );
			if ( !triangle ) { console.log( 'surface error', surface ); continue; }

			//console.log( 'triangle,normal', triangle.normal() );

			const obj = new THREE.Object3D();
			obj.lookAt( triangle.normal );  // copy the rotation of the triangle
			obj.quaternion.conjugate();
			obj.updateMatrixWorld();

			points.map( point => obj.localToWorld( point ) );
			//console.log( 'points', points );

			const area = THREE.ShapeUtils.area( points );
			areaTotal += area;
			//console.log( 'area', THREE.ShapeUtils.area( points ) );

			//surface.area = area;
			NUM[ 'surfaces' + type + 'Area' ] = areaTotal;

		}

		return NUM[ 'surfaces' + type + 'Area' ];

	};



	NUM.getSurfacesAreaByArrayOfSurfaces = function( surfaces ) {
		// console.log( '', surfaces );

		let area = 0;

		for ( let surface of surfaces ) {
			//console.log( 'undergroundWall', undergroundWall.PlanarGeometry.PolyLoop );

			const points = surface.userData.data.PlanarGeometry.PolyLoop.CartesianPoint
				.map( CartesianPoint => new THREE.Vector3().fromArray( CartesianPoint.Coordinate ) );
			//console.log( 'points', points );

			//const triangle = NUM.getTriangle( points );
			const triangle = GBX.getPlane( points );
			//console.log( 'triangle', triangle );

			if ( !triangle ) { console.log( 'surface error', surface ); continue; }

			//console.log( 'triangle,normal', triangle.normal() );

			const obj = new THREE.Object3D();
			obj.lookAt( triangle.normal );  // copy the rotation of the triangle
			obj.quaternion.conjugate();
			obj.updateMatrixWorld();

			points.map( point => obj.localToWorld( point ) );
			//console.log( 'points', points );

			area += THREE.ShapeUtils.area( points );
			//console.log( 'area', THREE.ShapeUtils.area( points ) );

			//NUM[ 'surfaces' + type + 'Area' ] = area;

		}

		return area;

	};



	NUM.setOrientationAreas = function( target ){

		const surfaces = GBX.surfacesJson.filter( element => element.surfaceType === 'ExteriorWall' );

		NUM.oriented = { // global
			North: { items: [], openings: [], color: 'Blue' },
			NorthEast: { items:[], openings: [], color: 'Magenta' },
			East: { items:[], openings: [], color: 'DarkOrange' },
			SouthEast: { items:[], openings: [], color: 'OrangeRed' },
			South: { items:[], openings: [], color: 'Red' },
			SouthWest: { items:[], openings: [], color: 'Salmon' },
			West: { items:[], openings: [], color: 'Chocolate' },
			NorthWest: { items:[], openings: [], color: 'Gold' }
		};

		const keys = Object.keys( NUM.oriented );
		//console.log( 'keys', keys );

		for ( let key of keys ) {

			NUM.oriented[ key ].material = new THREE.MeshBasicMaterial( { color: NUM.oriented[ key ].color.toLowerCase(), side: 2 } );

		}

		for ( let surface of surfaces ) {
			//console.log( 'undergroundWall', undergroundWall.PlanarGeometry.PolyLoop );

			const points = surface.PlanarGeometry.PolyLoop.CartesianPoint
				.map( CartesianPoint => new THREE.Vector3().fromArray( CartesianPoint.Coordinate ) );
			//console.log( 'points', points );

			//const triangle = NUM.getTriangle( points );
			const triangle = GBX.getPlane( points );
			//console.log( 'normal', triangle.normal );

			if ( !triangle ) { console.log( 'error', surface ); continue; }
			const angle = Math.atan2( triangle.normal.y, triangle.normal.x) * 180 / Math.PI + 180;
			//console.log( 'angle', angle );


			const wall = GBX.surfaceMeshes.children.find( ( element ) => element.userData.data.id === surface.id );

			if ( angle < 22.5 && angle >= 0 || angle > 337.5 && angle < 360 ) {

				wall.material = NUM.oriented.East.material;
				NUM.oriented.East.items.push( wall );

			} else if ( angle >= 22.5 && angle < 67.5) {

				wall.material = NUM.oriented.SouthEast.material;
				NUM.oriented.SouthEast.items.push( wall );

			} else if ( angle >= 67.7 && angle < 112.5 ) {

				wall.material = NUM.oriented.South.material;
				NUM.oriented.South.items.push( wall );

			} else if ( angle >= 112.5 && angle < 157.5 ) {

				wall.material = NUM.oriented.SouthWest.material;
				NUM.oriented.SouthWest.items.push( wall );

			} else if ( angle >= 157.5 && angle < 202.5 ) {

				wall.material = NUM.oriented.West.material;
				NUM.oriented.West.items.push( wall );

			} else if ( angle >= 202.5 && angle < 247.5 ) {

				wall.material = NUM.oriented.NorthWest.material;
				NUM.oriented.NorthWest.items.push( wall );

			}	else if ( angle >= 247.5 && angle < 292.5 ) {

				wall.material = NUM.oriented.North.material;
				NUM.oriented.North.items.push( wall );

			} else {  // > 292 && < 337.5

				wall.material = NUM.oriented.NorthEast.material;
				NUM.oriented.NorthEast.items.push( wall );

			}

		}

		for ( let opening of NUM.openingsJson ) {
			//console.log( 'opening', opening );

			const points = opening.PlanarGeometry.PolyLoop.CartesianPoint
				.map( CartesianPoint => new THREE.Vector3().fromArray( CartesianPoint.Coordinate ) );
			//console.log( 'points', points );

			//const triangle = NUM.getTriangle( points );
			const triangle = GBX.getPlane( points );
			//console.log( 'normal', triangle.normal );
			if ( !triangle ) { console.log( 'error', surface ); continue; }

			const angle = Math.atan2( triangle.normal.y, triangle.normal.x) * 180 / Math.PI + 180;
			//console.log( 'angle', angle );

			const openingMesh = GBX.surfaceOpenings.children.find( ( element ) => element.userData.data.id === opening.id );

			if ( !openingMesh ) {
				//console.log( 'no mesh', opening );
				continue;
			}

			if ( angle < 22.5 && angle >= 0 || angle > 337.5 && angle < 360 ) {

				NUM.oriented.East.openings.push( openingMesh );

			} else if ( angle >= 22.5 && angle < 67.5) {

				NUM.oriented.SouthEast.openings.push( openingMesh );

			} else if ( angle >= 67.7 && angle < 112.5 ) {

				NUM.oriented.South.openings.push( openingMesh );

			} else if ( angle >= 112.5 && angle < 157.5 ) {

				NUM.oriented.SouthWest.openings.push( openingMesh );

			} else if ( angle >= 157.5 && angle < 202.5 ) {

				NUM.oriented.West.openings.push( openingMesh );

			} else if ( angle >= 202.5 && angle < 247.5 ) {

				NUM.oriented.NorthWest.openings.push( openingMesh );

			}	else if ( angle >= 247.5 && angle < 292.5 ) {

				NUM.oriented.North.openings.push( openingMesh );

			} else if ( angle >= 292 && angle < 337.5 ) {  // > 292 && < 337.5

				NUM.oriented.NorthEast.openings.push( openingMesh );

			} else {

				console.log( 'oops', openingMesh );

			}

		}


		let txt = '';
		let num;

		for ( let key of keys ) {

			NUM.oriented[ key ].areaWalls = NUM.getSurfacesAreaByArrayOfSurfaces( NUM.oriented[ key ].items );
			NUM.oriented[ key ].areaOpenings = NUM.getSurfacesAreaByArrayOfSurfaces( NUM.oriented[ key ].openings );

			if ( NUM.oriented[ key ].openings.length > 0 ) {

				num = 'wwr:' + Math.round( 100 * NUM.oriented[ key ].areaOpenings / NUM.oriented[ key ].areaWalls ).toLocaleString() + '%';

			} else {

				num = '';

			}

			txt += '<button onclick=NUM.showSurfacesInArray("' + key + '"); style="width:5rem;background-color:' + NUM.oriented[ key ].color + ' !important;" >' + key +
			'</button> wall:' + Math.round(NUM.oriented[ key ].areaWalls).toLocaleString() +
			' open:' + Math.round(NUM.oriented[ key ].areaOpenings).toLocaleString() +
			' ' + num + '<br>';

		}

		target.innerHTML =
			`<details>
				<summary >Areas & Ratios by Orientation</summary>
				<p >` +
				txt +
				`</p>
			</details>`;

	};


	////////// Show ? Hide

	NUM.showSurfacesInArray = function ( key ) {

		const surfaces = NUM.oriented[ key ].items;
		GBX.surfaceMeshes.children.forEach( element => element.visible = false );
		surfaces.forEach( element => element.visible = true );

	};



	//combine with by array

	NUM.showBySurfaceTypeArray = function( types ) {

		console.log( 'types', types );

		const spaces = GBX.gbjson.Campus.Building.Space;

		GBX.surfaceMeshes.visible = true;

		GBX.surfaceMeshes.children.forEach( element => element.visible = false );

		for ( let child of GBX.surfaceMeshes.children ) {

			//adjacentSpaceId = child.userData.data.AdjacentSpaceId

			//if ( !adjacentSpaceId ) { continue; }

			//spaceIdRef = Array.isArray( adjacentSpaceId ) ? adjacentSpaceId[ 1 ].spaceIdRef : adjacentSpaceId.spaceIdRef

			spaces.forEach( element => { child.visible = types.includes( child.userData.data.surfaceType )  ? true : child.visible;

			} );

		}

		GBX.floorSlabs = GBX.surfaceMeshes.children.filter( child => child.visible === true );
		//console.log( 'GBV.floorSlabs', GBV.floorSlabs);

	};



	NUM.showFloorSlabs = function( id ) {

		//console.log( 'id', id );

		GBX.surfaceEdges.visible = true;
		GBX.surfaceMeshes.visible = true;
		GBX.openingMeshes.visible = false;

		const spaces = GBX.gbjson.Campus.Building.Space;

		const types = ['InteriorFloor', 'SlabOnGrade', 'RaisedFloor', 'UndergroundSlab'];

		GBX.surfaceMeshes.children.forEach( element => element.visible = false );

		for ( let child of GBX.surfaceMeshes.children ) {

			adjacentSpaceId = child.userData.data.AdjacentSpaceId;

			if ( !adjacentSpaceId ) { continue; }

			spaceIdRef = Array.isArray( adjacentSpaceId ) ? adjacentSpaceId[ 1 ].spaceIdRef : adjacentSpaceId.spaceIdRef;

			spaces.forEach( element => { child.visible = element.id === spaceIdRef &&
				element.buildingStoreyIdRef === id  &&
				types.includes( child.userData.data.surfaceType )  ? true : child.visible;

			} );

		}

		NUM.floorSlabs = GBX.surfaceMeshes.children.filter( child => child.visible === true );
		//console.log( 'GBV.floorSlabs', GBV.floorSlabs);

	};



	NUM.initNumbers();
