// Copyright 2018 Ladybug Tools authors. MIT License
	var EDT = {};

	var telltale;
	var surfaceUpdatedId = -1;

	initEditor();


	function initEditor() {

		if ( butEditor.style.backgroundColor !== 'var( --but-bg-color )' ) {

			divMenuItems.innerHTML =
			`
				<details id = detSurfaceEdits  class=app-menu open title='Use up and down cursor keys to scroll through the list of surfaces quickly' >

					<summary>Surface Edits</summary>
/*
					<p style=background-color:yellow;color:red;>This menu will be deprecated. Use other edit buttons.</p>
*/
					<p><small><i>Select a surface in the left column then update its type and adjacent spaces</i></small></p>

					<div id=divGbxml style=max-height:600px;overflow:auto; class=flex-container ></div>

					<div id=divUpdates >
						<button onclick=EDT.updateSurface(); title='Click here to confirm the updates' >update surface</button>
						<button onclick=GBV.deleteSurface(selSurface.value); title='Removes the selected surface from the model' >delete surface</button>
						<button onclick=EDT.addModifiedBy(); title='adds name, app, date and time of the edits' >add ModifiedBy </button>
						<button onclick=GBV.saveFile(); title='creates a new file with the changes' >save edits</button>
<!--						<button onclick=EDT.viewPreviousUpdates(); >view previous update</button> -->
					</div>

					<hr>

				</details>

			` + divMenuItems.innerHTML;

			butEditor.style.backgroundColor = 'var( --but-bg-color )';

			initMenuEditSurfaces();

		} else {

			detSurfaceEdits.remove();

			butEditor.style.backgroundColor = '';

		}

	}



	function initMenuEditSurfaces() {

		EDT.surfacesXml = GBX.gbxml.getElementsByTagName("Surface");
//		console.log( 'EDT.surfacesXml', EDT.surfacesXml );

		let txtSurfaces = '';

		for ( let i = 0; i < EDT.surfacesXml.length; i++) {

			const surface = EDT.surfacesXml[ i ];
			//console.log( 'surface', surface );

			if ( surface.getElementsByTagName("Name")[0] ) {

				name = surface.getElementsByTagName("Name")[0].textContent;
				//console.log( 'name', name );

			} else {

				name = '';

			}

			txtSurfaces +=
				'<option title=' + name + '>' +
					surface.attributes.getNamedItem( 'id' ).nodeValue +
				'</option>';

		}

		//console.log( 'surfaceTypes', surfaceTypes);

		let txtTypes = '';

		for ( let i = 0; i < GBX.surfaceTypes.length; i++ ) {

			txtTypes += '<option>' + GBX.surfaceTypes[ i ] + '</option>';

		}

		spacesXml = GBX.gbxml.getElementsByTagName("Space");
		spacesXmlIds = ['none'];
		//console.log( 'spacesXml', spacesXml );

		let txtSpaces = '<option>none</option>';

		for ( let i = 0; i < spacesXml.length; i++) {

			const space = spacesXml[ i ];
			const id = space.attributes.getNamedItem( 'id' ).nodeValue;
			spacesXmlIds.push( id );

			txtSpaces += '<option>' + id + '</option>';

		}

		divGbxml.innerHTML =

			'<div>' +
				'<div>Surface</div>' +
				'<div><input id=inpSurface oninput=EDT.updateSelect(this,selSurface); size=12 placeholder="enter surface id" ></div>' +
				'<div><select id=selSurface onchange=EDT.selectSurface(); size=10 >' + txtSurfaces + '</select></div>' +
				'<div><button onclick=EDT.toggleSurface(); >show surface</button></div>' +
			'</div> ' +
			'<div>' +
				'<div>Type</div>' +
				'<div><input oninput=EDT.updateSelect(this,selType); size=12  placeholder="enter type" ></div>' +
				'<div><select id=selType size=10 >' + txtTypes + '</select></div>' +
				'<div><button onclick=EDT.showSurfaceType(); >show type</button></div>' +
			'</div> ' +
			'<div>' +
				'<div>Adjacency 1</div>' +
				'<div><input oninput=EDT.updateSelect(this,selAdjacentSpaceId0); size=12 placeholder="enter space id" ></div>' +
				'<div><select id=selAdjacentSpaceId0 size=10 >' + txtSpaces + '</select></div>' +
				'<div><button onclick=EDT.toggleSpace(selAdjacentSpaceId0); >show space</button></div>' +
			'</div> ' +
			'<div>' +
				'<div>Adjacency 2</div>' +
				'<div><input oninput=EDT.updateSelect(this,selAdjacentSpaceId1); size=12 placeholder="enter space id" ></div>' +
				'<div><select id=selAdjacentSpaceId1 size=10 >' + txtSpaces + '</select></div>' +
				'<div><button onclick=EDT.toggleSpace(selAdjacentSpaceId1); >show space</button></div>' +
			'</div>' +
		'';

	}



	EDT.updateSelect = ( input, select ) => {

		const str = input.value.toLowerCase();

		for ( let option of select.options ) {

			if ( option.value.toLowerCase().includes( str ) ) {

				select.value = option.value;

				break;

			}

		}

	}



	EDT.selectSurface = () => {

		const surface = EDT.surfacesXml[ selSurface.selectedIndex ];
		//console.log( 'surface', surface );

		const type = surface.attributes.getNamedItem( 'surfaceType' ).nodeValue;
		//console.log( 'type', type );

		selType.selectedIndex = GBX.surfaceTypes.indexOf( type );

		const adjs = surface.getElementsByTagName( 'AdjacentSpaceId' );

		if ( adjs[ 0 ] ) {

			index = spacesXmlIds.indexOf( adjs[ 0 ].attributes.getNamedItem( 'spaceIdRef' ).nodeValue );

		} else {

			index = 0;

		}

		selAdjacentSpaceId0.selectedIndex = index;

		if ( adjs[ 1 ] ) {

			index = spacesXmlIds.indexOf( adjs[ 1 ].attributes.getNamedItem( 'spaceIdRef' ).nodeValue );

		} else {

			index = 0;

		}

		selAdjacentSpaceId1.selectedIndex = index;

		EDT.toggleSurface();

	}



	EDT.updateSurface = () => {

		if ( selSurface.selectedIndex < 0 ) { alert( 'Please first select a surface and make an edit' ); return; }

		surface = EDT.surfacesXml[ selSurface.selectedIndex ];
		//console.log( 'surface', surface );

		surface.attributes.getNamedItem( 'surfaceType' ).nodeValue = selType.value;

		const id = selSurface.value;

		for ( child of surfaceMeshes.children ) {

			if ( id === child.userData.data.id ) {
				// console.log( 'child', child );
				child.material.color.setHex( GBX.colors[ selType.value ] );
				child.material.needsUpdate = true
				break;
			}

		}

		const adjs = surface.getElementsByTagName( 'AdjacentSpaceId' );
		//console.log( 'adjs[ 0 ]', adjs[ 0 ].attributes.getNamedItem( 'spaceIdRef' ).nodeValue );

		adjs[ 0 ].attributes.getNamedItem( 'spaceIdRef' ).nodeValue = selAdjacentSpaceId0.value;

		if ( adjs[ 1 ] ) {

			adjs[ 1 ].attributes.getNamedItem( 'spaceIdRef' ).nodeValue = selAdjacentSpaceId1.value;

		}

		//		GBX.parseFileXML( gbxml );

	}



	EDT.viewPreviousUpdates = () => {

		if ( surfaceUpdatedId < 0 ) { alert( 'Please first select a surface and make an edit' ); return; }

		selSurface.selectedIndex = surfaceUpdatedId;
		EDT.selectSurface();

	}



	EDT.toggleSurface = () => {

		if ( selSurface.selectedIndex < 0 ) { alert( 'Please first select a surface and make an edit' ); return; }

		const id = selSurface.value;
		GBV.showSurface( id );
		GBV.zoomIntoSurface( id );

		if ( window.divHeadsUp ) {

			const surfaceMesh = GBX.surfaceMeshes.children.find( element => element.userData.data.id === id );
			intersected = surfaceMesh;
			HUD.setHeadsUp();

		}

		/*
		for ( let child of surfaceMeshes.children ) {

			if ( id === child.userData.data.id ) {

				child.visible = true;
				//console.log( '', child );

				//EDT.zoomIntoSurface( child );

				if ( window.divHeadsUp ) {

					intersected = child;
					HUD.setHeadsUp();

				}

			} else {

				child.visible = false;

			}

		};
		*/
	}



	EDT.showSurfaceType = ( that ) => {

		const type = selType.value;

		for ( let child of GBX.surfaceMeshes.children ) {

			if ( type === child.userData.data.surfaceType ) {

				child.visible = true;

			} else {

				child.visible = false;

			}

		}

	}



	EDT.toggleSpace = ( that ) => {

		id = that.value;

		for ( let child of GBX.surfaceMeshes.children ) {

			child.visible = false;
			adjacentSpaceId = child.userData.data.AdjacentSpaceId;

			if ( adjacentSpaceId && adjacentSpaceId.spaceIdRef && id === adjacentSpaceId.spaceIdRef ) {

				child.visible = true;

			} else if ( Array.isArray( adjacentSpaceId ) === true ) {

				if ( id === adjacentSpaceId[ 0 ].spaceIdRef || id === adjacentSpaceId[ 1 ].spaceIdRef ) {

					child.visible = true;

				}

			}

		}

	}



	EDT.xxxxzoomIntoSurface = ( surface ) => {
		//console.log( 'surface', surface );

		const center = surface.localToWorld( surface.geometry.boundingSphere.center.clone() );

		const radius = surface.geometry.boundingSphere.radius > 1 ? surface.geometry.boundingSphere.radius : 1;

		THR.scene.remove( telltale );
		const geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
		const material = new THREE.MeshNormalMaterial( { opacity: 0.7, transparent: true } );
		telltale = new THREE.Mesh( geometry, material );
		telltale.position.copy( center );
		THR.scene.add( telltale );

		THR.controls.target.copy( center );
		THR.camera.position.copy( center.clone().add( new THREE.Vector3( 3.0 * radius, - 3.0 * radius, 3.0 * radius ) ) );

		//console.log( 'center', center, radius );

	}



	EDT.deleteSurface = () => {

		if ( selSurface.selectedIndex < 0 ) { alert( 'Please first select a surface and make an edit' ); return; }

		id = selSurface.value;

		const proceed = confirm( 'OK to delete surface: ' + id + '?' );

		if( !proceed ){ return; }

		surfaceUpdatedId = selSurface.selectedIndex;
		surfacesResponse = gbxmlResponseXML.getElementsByTagName("Surface");

		surface = surfacesResponse[ surfaceUpdatedId ];

		console.log( 'surface to delete', surface );

		surface.remove();


		for ( let child of GBX.surfaceMeshes.children ) {

			if ( id === child.userData.data.id ) {

				GBX.surfaceMeshes.remove( child );

			}

		}

		initMenuEditSurfaces();

	}



	EDT.addModifiedBy = () => {

		// not adding spaces and new lines nicely. Why?

		documentHistoryXml = GBX.gbxmlResponseXML.getElementsByTagName( "DocumentHistory" );

		const programInfoNew = GBX.gbxmlResponseXML.createElement( "ProgramInfo" );

		programInfoNew.setAttribute( "id", "ladybug-tools-spider" );

		documentHistoryXml[ 0 ].appendChild( programInfoNew );

		const productNameNew = GBX.gbxmlResponseXML.createElement( "ProductName" );

		const newText = GBX.gbxmlResponseXML.createTextNode( 'Ladybug-Tools/spider' );

		productNameNew.appendChild( newText );

		programInfoNew.appendChild( productNameNew );

		productNameNew.nodeValue = 'Ladybug-Tools/spider';


		const modifiedByNew = GBX.gbxmlResponseXML.createElement( "ModifiedBy" );

		modifiedByNew.setAttribute( "personId", "Your name" );

		modifiedByNew.setAttribute( "programId", "ladybug-tools-spider" );

		modifiedByNew.setAttribute( "date", ( new Date() ).toISOString() );

		documentHistoryXml[ 0 ].appendChild( modifiedByNew );

		alert( 'Adding to gbXML:\n\n' + GBX.gbxmlResponseXML.getElementsByTagName( "ModifiedBy" )[0].outerHTML );

	}



// https://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript
// https://jsfiddle.net/klesun/sgeryvyu/5/

	EDT.prettifyXml = (sourceXml) => {

		var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
		var xsltDoc = new DOMParser().parseFromString([
			// describes how we want to modify the XML - indent everything
			'<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
			'  <xsl:output omit-xml-declaration="yes" indent="yes"/>',
			'    <xsl:template match="node()|@*">',
			'      <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
			'    </xsl:template>',
			'</xsl:stylesheet>',
		].join('\n'), 'application/xml');

		var xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet(xsltDoc);
		var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
		var resultXml = new XMLSerializer().serializeToString(resultDoc);
		return resultXml;

	}



	EDT.saveFile = () => {

		//		xmlText = prettifyXml( gbxmlResponseXML ); // not
		const xmlText = new XMLSerializer().serializeToString( gbxml );
		//console.log( 'xmlText', xmlText );

		var blob = new Blob( [ xmlText ] );
		var a = document.body.appendChild( document.createElement( 'a' ) );
		a.href = window.URL.createObjectURL( blob );
		a.download = gbjson.Campus.Building.id + '.xml';
		a.click();
		//		delete a;
		a = null;

	}

