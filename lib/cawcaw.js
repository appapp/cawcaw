/*

cawcaw.js
https://github.com/appapp/cawcaw

*/
/*

Copyright 2013 (c) Alfonso Polo Prieto <app.app@gmail.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/


"use strict";
( function( 
  cawcaw /* cawcaw AKA exports AKA that AKA this */, 
  util,
  crypto,
  _
) {
      cawcaw.base = {
        baseformatSeparator: ",",
        
        fromNumberToBase16: function( number ){
          return number.toString( 16 );
        },
        fromBase16ToNumber: function( base16 ){
          return parseInt( base16, 16 );
        },
        stringToBytes: function( str ){
          var ret = [];
          if( !str ){ return ret; }

          var strUtf8 = decodeURIComponent( encodeURIComponent( str ) );
          var i, sz = strUtf8.length;
          for( i = 0 ; i < sz ; i++ ){
            ret.push( strUtf8.charCodeAt( i ) );
          }

          return ret;
        },
        bytesToString: function( bytes ){
          var ret = "";
          var i, sz = bytes.length;
          for( i = 0; i < sz ; i++ ) {
            ret = ret + String.fromCharCode( bytes[i] );
          }
          return ret;
        },
        stringToBase16: function( str ){
          var bytes = cawcaw.base.stringToBytes( str );
          var ret = cawcaw.base.bytesToBase16( bytes );
          return ret;
        },
        bytesToBase16: function( bytes ){
          var i, ret= "", sz = bytes.length;
          for( i = 0 ; i < sz ; i++ ){
            ret = ret + cawcaw.base.byteToBase16( bytes[i] );
          }

          return ret;
        },
        byteToBase16: function( byte ){
          var tmpRet = cawcaw.base.fromNumberToBase16( byte );
          var ret = ( "00" + tmpRet ).slice( -2 );
          return ret;
        },
        fromBaseformatToNumber: function( baseformat ){
          var ret = null;
          if( !baseformat ){ return ret; }

          var bfparts = baseformat.split( cawcaw.base.baseformatSeparator );
          if( bfparts.length === 2 ){ /* jshint eqeqeq:false */
              if( bfparts[1] == 16 ){
                ret = cawcaw.base.fromBase16ToNumber( bfparts[0] );

              } else if( bfparts[1] == 10 ){
                ret = parseInt( bfparts[0], 10 );
              }

          } else if( bfparts.length === 1 ){
            ret = parseInt( bfparts[0], 10 );
          }

          return ret;
        }
      };




      cawcaw.model = {};
      //
      var _cawcaw_model_data_Factory = function(){
        if( !(this instanceof _cawcaw_model_data_Factory ) ){ throw new Error( "constructor can't be called as a function" ); }
      };
          _cawcaw_model_data_Factory.prototype.createMessage = function( messagetxt, settings ){
            var ret = new cawcaw.model.data.Message();
            ret.private.settings = settings || new cawcaw.model.data.Settings();
            ret.private.message = messagetxt || "";
            
            _cawcaw_model_data_Factory.createPartsFromByteGetTime = new Date().getTime(); //reset createPartsFromByteGetTime, auxiliar timer for h //TODO asuntoNewDateGetTimeCONTADORorden
            ret.private.parts = 
              this.createPartsFromBytes( 
                cawcaw.base.stringToBytes( ret.private.message ) );

            return ret;
          };
          _cawcaw_model_data_Factory.prototype.createPacketsFromParts = function( parts ){
            var ret = [];
            parts = parts || [];
            var i, packet, sz = parts.length;
            for( i = 0; i < sz ; i++ ){
              packet = this.createPacketFromPart( parts[i] );
              ret.push( packet );
            }

            return ret;
          };
          _cawcaw_model_data_Factory.prototype.createPacketFromPart = function( part ){
            part = part || new cawcaw.model.data.Part();
            var ret = _.clone( part );
            delete ret.d;

            return ret;
          };
          _cawcaw_model_data_Factory.prototype.createPartsFromBytes = function( bytes ){
            var ret = [];
            var parts, i, sz = bytes.length;
            for( i = 0; i < sz ; i++ ) {
              //create parts elements and add
              parts = this.createPartsFromByte( bytes[i] );
              ret.push.apply( ret, parts );
            }
            return ret;
          };
          _cawcaw_model_data_Factory.createPartsFromByteMask2bits = parseInt( "11", 2 ); //TODO 2bitsFijos???
          _cawcaw_model_data_Factory.createPartsFromByteGetTime = (new Date()).getTime(); //TODO asuntoNewDateGetTimeCONTADORorden
          _cawcaw_model_data_Factory.prototype.createPartsFromByte = function( byte ){
            var retTmp = [];
            var part, i, sz = 4; //TODO 2bitsFijos???
            for( i = 0; i < sz ; i++ ) {
              //create part element and add
              part = new cawcaw.model.data.Part();
              part.d = byte & _cawcaw_model_data_Factory.createPartsFromByteMask2bits;//TODO 2bitsFijos???
              part.h = null;
              part.t = cawcaw.base.fromNumberToBase16( _cawcaw_model_data_Factory.createPartsFromByteGetTime-- ); //TODO asuntoNewDateGetTimeCONTADORorden
              retTmp.push( part );
              //we need modify byte to create next part
              byte = byte >> 2;  //TODO 2bitsFijos???
            }
            //sort process
            var ret = _.sortBy(
              retTmp,
              function( part ){ 
                return part.t;
              } );

            return ret;
          };
          _cawcaw_model_data_Factory.prototype.createBytesFromParts = function( parts ){
            var ret = [];
            var i, j = 0, byte = 0, sz = parts.length;
            for( i = 0 ; i < sz ; i++ ) {
              byte = byte << 2;  //TODO 2bitsFijos???
              byte = byte | parts[i].d;  //TODO 2bitsFijos???
              if( j === 3 ){ // TODO 3=4-1  2bitsFijos???
                ret.push( byte );
                byte = 0;
                j = 0;

              } else {
                j++;
              }
            }

            return ret;
          };
      cawcaw.model.data = { /* jshint -W055:true */
        Factory: _cawcaw_model_data_Factory,
      };

      cawcaw.model.data.Settings = function(){
        this.k = "FFFFvQs";
        this.seed = "CCCCvQs";
      };

      cawcaw.model.data.Packet = function(){
        this.t = "f8aa";
        this.h = "f8f6a85add8e72ede9a81afa2fe66a3f8d41e04683d6ed84c81a1017283f00dc";
      };

      cawcaw.model.data.Part = function(){
        cawcaw.model.data.Part.super_.call( this );
        //
        this.d = 0;
      };
      util.inherits( cawcaw.model.data.Part, cawcaw.model.data.Packet );

      cawcaw.model.data.Message = function(){
        this.private = {};
        this.private.settings = new cawcaw.model.data.Settings();
        this.private.message = "hello";
        this.private.parts = [];
        //
        this.public = {};
        this.public.packets = [];
      };
      //
      //
      cawcaw.model.server = {};  //TODO continue .... 4ServerInfraestructure




      var _cawcaw_data_Core = function(){
        if( !(this instanceof _cawcaw_data_Core ) ){ throw new Error( "constructor can't be called as a function" ); }
      };
          _cawcaw_data_Core.prototype.createRandomByteBase16 = function(){
            return cawcaw.base.fromNumberToBase16(
              this.createRandomByte() );
          };
          _cawcaw_data_Core.prototype.createRandomByte = function(){
            return Math.floor( Math.random() * 255 );
          };
          _cawcaw_data_Core.prototype.createHashDigest = function( previous, data, password ){
            var hmac = this.createHmac( password );
            var data4update = this.base16xorNumber( previous, data );
            return hmac.update( data4update ).digest( "hex" );
          };
          _cawcaw_data_Core.createHmacDefaultHmac = "sha256";//TODO hmacFijo???
          _cawcaw_data_Core.prototype.createHmac = function( password ){
            return crypto.createHmac( _cawcaw_data_Core.createHmacDefaultHmac, password ); //TODO 2bitsFijos???  //TODO hmacFijo???
          };
          _cawcaw_data_Core.prototype.base16xorNumber =function( base16, number ){
            var val4cut = base16.length - 2; //TODO 2bitsFijos???
            var base16firsts = base16.substring( 0, val4cut );
            var base16lasts = base16.substring( val4cut );

            var number0 = cawcaw.base.fromBase16ToNumber( base16lasts );
            var xor = number0 ^ number;
            var newBase16lasts = cawcaw.base.fromNumberToBase16( xor );

            return base16firsts + newBase16lasts ;
          };
      var _cawcaw_data_Chaffing = function(){ /* jshint -W055:true */
        if( !(this instanceof _cawcaw_data_Chaffing ) ){ throw new Error( "constructor can't be called as a function" ); }
        //
        this.core = new _cawcaw_data_Core();
        this.dataFactory = new _cawcaw_model_data_Factory();
      };
          _cawcaw_data_Chaffing.prototype.addRealPackets = function( message ){
            //the first previous is message.private.settings.seed
            var previous = cawcaw.base.stringToBase16( message.private.settings.seed );
            var i, sz = message.private.parts.length;
            for( i = 0; i < sz ; i++ ) {
              message.private.parts[i].h = 
                this.core.createHashDigest( 
                  previous,
                  message.private.parts[i].d,
                  message.private.settings.k   );
                //we need modify previous to create next part[i].h
                previous = message.private.parts[i].h;
            }
            //add real packets in message public zone ( from private parts )
            message.public.packets = 
              this.dataFactory.createPacketsFromParts( 
                message.private.parts );

            return message;
          };
          _cawcaw_data_Chaffing.prototype.addFakePackets = function( message ){
            message.public.packets = 
              this.createFakePackets(
                message.public.packets );

            return message;
          };
          _cawcaw_data_Chaffing.prototype.createFakePackets = function( packets ){ //TODO necesariaMejoraAleatoriedad
            var ret = [];
            var i, sz = packets.length;
            for( i = 0; i < sz ; i++ ) {
              ret.push.apply( 
                ret, 
                this.createFakePacketsFromPacket( packets[i], 3 ) ); //TODO fakeSizeToAdd + 2bitsFijos???
            }

            return ret;
          };
          _cawcaw_data_Chaffing.prototype.createFakePacketsFromPacket = function( packet, numFakePacketsToAdd ){ //TODO necesariaMejoraAleatoriedad
            var retTmp = [];
            numFakePacketsToAdd = numFakePacketsToAdd || 1; // TODO fakeSizeToAdd

            //add fake packets
            var i, fakePacket;
            for( i = 0; i < numFakePacketsToAdd ; i++ ) {
              fakePacket = new cawcaw.model.data.Packet();
              fakePacket.t = packet.t + this.core.createRandomByteBase16(); //4 random order
              fakePacket.h = 
                this.core.createHashDigest( 
                  this.core.createRandomByteBase16(),
                  this.core.createRandomByte(),
                  this.core.createRandomByteBase16()   );
              retTmp.push( fakePacket );
            }
            //add real packet
            packet.t = packet.t + this.core.createRandomByteBase16(); //4 random order
            retTmp.push( packet );
            //sort process
            var ret = _.sortBy(
              retTmp,
              function( part ){ 
                return part.t;
              } );

            return ret;
          };
      var _cawcaw_data_Winnowing = function(){ /* jshint -W055:true */
        if( !(this instanceof _cawcaw_data_Winnowing ) ){ throw new Error( "constructor can't be called as a function" ); }
        //
        this.core = new _cawcaw_data_Core();
      };
          _cawcaw_data_Winnowing.prototype.createPartsFromPackets = function( message ){
            message.private.parts = [];
            var previous = cawcaw.base.stringToBase16( message.private.settings.seed );
            var i, sz = message.public.packets.length, packet, d, part;
            for( i = 0; i < sz ; i++ ) {
              packet = message.public.packets[i];
              d = this.getDataPromPacket( 
                message.private.settings, 
                previous, 
                packet );
              if( d != null ){
                part = new cawcaw.model.data.Part();
                part.d = d;
                part.h = packet.h;
                part.t = packet.t;  //TODO asuntoNewDateGetTimeCONTADORorden
                message.private.parts.push( part );

                previous = packet.h;
              }
            }

            return message;
          };
          _cawcaw_data_Winnowing.prototype.getDataPromPacket = function( settings, previous, packet ){
            var ret = null;
            var hTmp, i = 0, sz = 4;  //TODO 2bitsFijos???
            do{
              //posible hash, posible data
              hTmp = this.core.createHashDigest(
                  previous,
                  i,
                  settings.k );
              //verifing posible data
              if( packet.h === hTmp ){
                ret = i;
              } else {
                i++;
              }
            } while( ret == null && ( i < sz ) );

            return ret;
          };
      var _cawcaw_data_Caw = function(){ /* jshint -W055:true */
        if( !(this instanceof _cawcaw_data_Caw ) ){ throw new Error( "constructor can't be called as a function" ); }
        //
        this.chaffing = new _cawcaw_data_Chaffing();
        this.winnowing = new _cawcaw_data_Winnowing();
        this.dataFactory = new _cawcaw_model_data_Factory();
      };
          _cawcaw_data_Caw.prototype.createPacketsFromMessage = function( message ){
            var ret = this.chaffing.addRealPackets( message );
            ret = this.chaffing.addFakePackets( message );
            return ret;
          };
          _cawcaw_data_Caw.prototype.createMessageFromPackets = function( message ){
            var message0 = this.winnowing.createPartsFromPackets( message );
            //
            var ret = new cawcaw.model.data.Message();
            ret.private.parts = message0.private.parts || [];
            ret.private.message = 
              cawcaw.base.bytesToString( 
                this.dataFactory.createBytesFromParts( ret.private.parts ) );
            return ret;
          };
      cawcaw.data = { /* jshint -W055:true */
        Core: _cawcaw_data_Core,
        Chaffing: _cawcaw_data_Chaffing,
        Winnowing: _cawcaw_data_Winnowing,
        Caw: _cawcaw_data_Caw,
        //
        caw: new _cawcaw_data_Caw()
      };




      cawcaw.server = {};  //TODO continue .... 4ServerInfraestructure




      return cawcaw;
})( /* jshint -W040:true */ /* jshint -W117:true */
  typeof exports === "undefined" ? _cawcaw = {} : exports /* exports AKA that AKA this */ ,
  typeof util === "undefined" ? require( "util" ) : util , 
  typeof requirejsCrypto === "undefined" ? require( "crypto" ) : requirejsCrypto ,
  typeof _ === "undefined" ? require( "underscore" )._ : _ 
);
