/*

cawcaw_test.js
https://bitbucket.org/appapp/cawcaw

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
var cawcaw = require( "../lib/cawcaw.js" );
var _ = require( "underscore" )._;

exports.cawcaw = {
   _message: "en un lugar de la Mancha de cuyo nombre no quiero acordarme",
   _10002343base16: "989fa7",
   _1000base16    : "3e8",
   _10002343baseformat16: "989fa7"+",16",

  setUp: function( donecb ) {
    donecb();// setup here
  },
  testBaseFromAndToFixedValues: function( test ) {
    test.expect( 4 ); //set num expected asserts

    // tests, asserts
    test.equal( cawcaw.base.fromNumberToBase16( 10002343 ), exports.cawcaw._10002343base16 );
    test.equal( cawcaw.base.fromNumberToBase16(     1000 ),     exports.cawcaw._1000base16 );
    //
    test.equal( cawcaw.base.fromBase16ToNumber( exports.cawcaw._10002343base16 ), 10002343 );
    test.equal( cawcaw.base.fromBase16ToNumber(     exports.cawcaw._1000base16 ),     1000 );

    // tests, end
    test.done();
  },
  testBaseFromAndToDateTime: function( test ) {
    test.expect( 1 ); //set num expected asserts

    // tests, assert
    var getTime, getTimeBase, getTime2;
    getTime     = (new Date()).getTime();
    getTimeBase = cawcaw.base.fromNumberToBase16( getTime );
    getTime2    = cawcaw.base.fromBase16ToNumber( getTimeBase );
    test.equal( getTime, getTime2 );

    // tests, end
    test.done();
  },
  testBaseformatFixedValues: function( test ) {
    test.expect( 1 ); //set num expected asserts

    // tests, assert
    //
    test.equal( cawcaw.base.fromBaseformatToNumber( exports.cawcaw._10002343baseformat16 ), 10002343 );

    // tests, end
    test.done();
  },
  testDataFixedValues: function( test ) {
    test.expect( 1 ); //set num expected asserts

    // tests, assert
    //
    var txt = "test1234567890test";
    var txtToBytes = cawcaw.base.stringToBytes( txt );
    var bytesToTxt = cawcaw.base.bytesToString( txtToBytes );
    test.equal( txt, bytesToTxt );

    // tests, end
    test.done();
  },
  testModel: function( test ) {
    test.expect( 19 ); //set num expected asserts

    // tests, assert
    //
    var packet = new cawcaw.model.data.Packet();
    test.ok( packet );
    test.ok( packet.t );
    test.ok( packet.h );
    test.ok( typeof packet.d === "undefined" );
    var part = new cawcaw.model.data.Part();
    test.ok( part );
    test.ok( part.t );
    test.ok( part.h );
    test.ok( typeof part.d !== "undefined" );
    var message = new cawcaw.model.data.Message();
    test.ok( message );
    test.ok( message.public );
    test.ok( message.public.packets );
    test.ok( message.public.packets.length === 0 );
    test.ok( message.private );
    test.ok( message.private.settings );
    test.ok( message.private.settings.k );
    test.ok( message.private.settings.seed );
    test.ok( message.private.message );
    test.ok( message.private.parts );
    test.ok( message.private.parts.length === 0 );

    // tests, end
    test.done();
  },
  testCreateMessage: function( test ) {
    test.expect( 6 ); //set num expected asserts

    // tests, assert
    //
    var dataFactory = new cawcaw.model.data.Factory();
    var txtmsg = "fooo";
    var message = dataFactory.createMessage( txtmsg, new cawcaw.model.data.Settings() );
    test.ok( message.private.settings );
    test.ok( message.private.settings.k );
    test.ok( message.private.settings.seed );
    test.ok( message.private.parts );
    //
    test.equal( message.private.message, txtmsg );
    test.equal( message.private.parts.length, txtmsg.length*4 );//TODO 2bitsFijos???

    // tests, end
    test.done();
  },
  testStringsToBase16: function( test ) {
    test.expect( 7 ); //set num expected asserts

    // tests, assert
    //
    test.equal( cawcaw.base.byteToBase16(   0 ), "00" );
    test.equal( cawcaw.base.byteToBase16(   1 ), "01" );
    test.equal( cawcaw.base.byteToBase16(  15 ), "0f" );
    test.equal( cawcaw.base.byteToBase16(  16 ), "10" );
    test.equal( cawcaw.base.byteToBase16( 255 ), "ff" );
    test.equal( cawcaw.base.bytesToBase16( [0,1,15,16,255] ), "00010f10ff" );
    test.equal( cawcaw.base.stringToBase16( "AZAZ" ), "415a415a" );

    // tests, end
    test.done();
  },
  testGetDataPromPackets: function( test ) {
    test.expect( 7 ); //set num expected asserts

    // tests, assert
    //
    var dataFactory = new cawcaw.model.data.Factory();
    var chaffing = new cawcaw.data.Chaffing();
    var winnowing = new cawcaw.data.Winnowing();
    var txt = exports.cawcaw._message;
    var message = dataFactory.createMessage( txt );
    message = chaffing.addRealPackets( message );
    test.equal( 
      winnowing.getDataPromPacket(
        message.private.settings,
        cawcaw.base.stringToBase16( message.private.settings.seed ),
        message.public.packets[0] ) ,
      message.private.parts[0].d
    );
    test.equal( 
      winnowing.getDataPromPacket(
        message.private.settings,
        message.public.packets[0].h,
        message.public.packets[1] ) ,
      message.private.parts[1].d
    );
    test.equal( 
      winnowing.getDataPromPacket(
        message.private.settings,
        message.public.packets[1].h,
        message.public.packets[2] ) ,
      message.private.parts[2].d
    );
    test.equal( 
      winnowing.getDataPromPacket(
        message.private.settings,
        message.public.packets[2].h,
        message.public.packets[3] ) ,
      message.private.parts[3].d
    );
    //
    test.equal( 
      winnowing.getDataPromPacket(
        message.private.settings,
        message.private.parts[2].h + "zzzz",
        message.private.parts[3] ) ,
      null
    );
    test.equal( 
      winnowing.getDataPromPacket(
        message.private.settings,
        message.private.parts[2].h,
        message.private.parts[3] + "yyyy" ) ,
      null
    );
    message.private.settings.k = message.private.settings.k + "zzzz";
    test.equal( 
      winnowing.getDataPromPacket(
        message.private.settings,
        message.private.parts[2].h,
        message.private.parts[3] ) ,
      null
    );

    // tests, end
    test.done();
  },
  testAddFakePackets: function( test ) {
    test.expect( 4 ); //set num expected asserts

    // tests, assert
    //
    var dataFactory = new cawcaw.model.data.Factory();
    var chaffing = new cawcaw.data.Chaffing();
    var txt = exports.cawcaw._message;
    var whereProps = {};
    var message = dataFactory.createMessage( txt );
    message = chaffing.addRealPackets( message );
    message = chaffing.addFakePackets( message );
    //check real packets exists in message.public.packets
    whereProps.h = message.private.parts[0].h;
    test.ok( _.findWhere( message.public.packets, whereProps ) );
    whereProps.h = message.private.parts[1].h;
    test.ok( _.findWhere( message.public.packets, whereProps ) );
    whereProps.h = message.private.parts[2].h;
    test.ok( _.findWhere( message.public.packets, whereProps ) );
    whereProps.h = message.private.parts[3].h;
    test.ok( _.findWhere( message.public.packets, whereProps ) );

    // tests, end
    test.done();
  },
  testCreatePartsFromPackets: function( test ) {
    test.expect( 4 ); //set num expected asserts

    // tests, assert
    //
    var dataFactory = new cawcaw.model.data.Factory();
    var chaffing = new cawcaw.data.Chaffing();
    var winnowing = new cawcaw.data.Winnowing();
    var txt = exports.cawcaw._message;
    var message0 = dataFactory.createMessage( txt );
    var message0privateParts = _.clone( message0.private.parts );
    var message = chaffing.addRealPackets( message0 );
    message = chaffing.addFakePackets( message );
    message.private.parts = [];
    message = winnowing.createPartsFromPackets( message );
    //check parts.d are equals in message0
    test.equal( message.private.parts[0].d, message0privateParts[0].d );
    test.equal( message.private.parts[1].d, message0privateParts[1].d );
    test.equal( message.private.parts[2].d, message0privateParts[2].d );
    test.equal( message.private.parts[3].d, message0privateParts[3].d );

    // tests, end
    test.done();
  },
  testFullTest: function( test ) {
    test.expect( 1 ); //set num expected asserts

    // tests, assert  _message
    //
    var chaffing = new cawcaw.data.Chaffing();
    var dataFactory = new cawcaw.model.data.Factory();
    var     txt0 = exports.cawcaw._message;
    var message0 = dataFactory.createMessage( txt0 );
        message0 = chaffing.addRealPackets( message0 );
        message0 = chaffing.addFakePackets( message0 );
    var message1 = cawcaw.data.caw.createMessageFromPackets( message0 );
    var     txt1 = message1.private.message;
    test.equal( txt0, txt1 );
    // tests, end
    test.done();
  }
};

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/


