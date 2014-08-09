/*global define */
/*jshint -W030 */

define([
		'intern!bdd'
	, 'intern/chai!expect'
	, 'sinon'
	, 'intern/order!jquery'
	, 'intern/order!candy/libs/libs.bundle'
	, 'intern/order!candy/candy.bundle'
	, 'intern/order!candy-plugins/autojoininvites/autojoininvites.js'
], function (bdd, expect, sinon, $) {
	bdd.describe('CandyShop.AutoJoinInvites', function () {
		bdd.describe('receiving an invite', function () {
			var invite = {
				roomJid: 'space\\20cadet@example.com',
				from: 'someone@example.com'
			};

			var sendInvite = function (invite) {
				$(Candy).triggerHandler('candy:core:chat:invite', invite);
			};

			bdd.before(function () {
				CandyShop.AutoJoinInvites.init();
			});

			bdd.it('joins the room', function () {
				var mock = sinon.mock(Candy.Core.Action.Jabber.Room);

				mock.expects("Join").once().withExactArgs('space cadet@example.com', undefined);

				sendInvite(invite);

				mock.verify();
				mock.restore();
			});

			bdd.describe('with a password', function () {
				var invite = {
					roomJid: 'space\\20cadet@example.com',
					from: 'someone@example.com',
					password: 'somepassword'
				};

				bdd.it('joins the room', function () {
					var mock = sinon.mock(Candy.Core.Action.Jabber.Room);

					mock.expects("Join").once().withExactArgs('space cadet@example.com', 'somepassword');

					sendInvite(invite);

					mock.verify();
					mock.restore();
				});
			});
		});
	});
});
