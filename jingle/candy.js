/**
 * Candy Plugin for Video Conferencing based on XEP-0166: Jingle
 *
 * Copyright: 2015-2016 Andrey Prokopenko <andrey_prokopenko@terem.fr>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));
var RTC = null;
var RTCPeerconnection = null;
CandyShop.Jingle = (function(self, Candy, $) {
		_initiator = false,		
		_session = null,
		_callinvite_accepted_ack = null,
		_call_accepted_peerjid = null,
		_peerjid = null,		
		_nick = null,
		_showterminate = true,		
		_handleError = function(stanza) {
			var $stanza = $(stanza),
				reason = $stanza.children('error').firstChild;
			_displayError(reason);
			_onTerminate($stanza.attr('from'));
		},
		_displayError = function(reason) {
			Candy.View.Pane.Chat.Modal.show($.i18n._('jingleReason-' + reason), true);
		},
		_onTerminate = function(jid) {
			try {
			if (!_peerjid) return;
  			Candy.Core.getConnection().jingle.localStream.getTracks().forEach(function (track) {
    				track.stop();
  			});
			if (document.getElementById('jingle-remoteView') != null) { 
				$('#jingle-localView').attr('src', '');
				$('#jingle-remoteView').attr('src', '');
				//$('#jingle-videos').remove();
			};
			if (Candy.View.Pane.Chat.rooms[_peerjid]) Candy.View.Pane.Room.close(_peerjid);	
			if (_session) {				
				_session.sendTerminate();
				try { _session.terminate(); } catch(e) {}
				_session=null;
			};
			_initiator = false;			
			_peerjid = null;		
			_nick = null;
			_callinvite_accepted_ack = null;
			_call_accepted_peerjid = null;
			_showterminate = true;
	  	    	} catch(e) { console.log("error while terminating session =>"+e.stack);}
		},

		_Template = {
			callConfirm: '<strong>{{_label}}</strong>'
				+ '<p><button class="button" id="jingle-call-confirm-yes">{{_labelYes}}</button> '
				+ '<button class="button" id="jingle-call-confirm-no">{{_labelNo}}</button></p>'
		};
	        _addVideoPane = function(jid,nick) {
		  Candy.View.Pane.PrivateRoom.open(jid, nick, true, false);
		  $('#chat-rooms > div[data-roomjid="' + jid + '"] > div.message-pane-wrapper').remove();
		  $('#chat-rooms > div[data-roomjid="' + jid + '"] > div.message-form-wrapper').remove();
		  $('#chat-rooms > div[data-roomjid="' + jid + '"]').append(
			  '<div id="jingle-videos">'
			+ '<video id="jingle-localView" autoplay="true"></video>'
			+ '<video id="jingle-remoteView" autoplay="true"></video>'
			+ '</div>');
			$('#chat-tabs li[data-roomjid="' + jid + '"] a.close')
				.click(function() {
					_showterminate=false;
					_onTerminate(_peerjid);
				});
		 
		},
               _sendCallInvitation = function () {
		var conn = Candy.Core.getConnection();
                var inv = $iq({to: _peerjid, type: 'set'})
                       .c('jingle', {xmlns: 'urn:xmpp:jingle:1',
                       action: 'call-invitation',
                       initiator: conn.jid });
                _initiator = true;
		Candy.View.Pane.Chat.Modal.hide();			
		Candy.View.Pane.Chat.Modal.show($.i18n._('callInvitationSent'), false, false);
                conn.sendIQ(inv,
                    function (stanza) {
			Candy.View.Pane.Chat.Modal.hide();			
			var action = $(stanza).find('jingle').attr('action');
			switch(action) {
			 case 'callinvite-denied': 
				_onTerminate();
				Candy.View.Pane.Chat.Modal.show($.i18n._('callInvitationDenied'), true, false);				
			        break;
 			 case 'callinvite-accepted':
				Candy.View.Pane.Chat.Modal.show($.i18n._('callInvitationAccepted'), true, false);				
				getUserMediaWithConstraints(['audio', 'video']);
			        break;
			}
                    },
                    function (stanza) {
                        var error = ($(stanza).find('error').length) ? {
                            code: $(stanza).find('error').attr('code'),
                            reason: $(stanza).find('error :first')[0].tagName,
                        }:{};
			Candy.View.Pane.Chat.Modal.hide();			
			Candy.View.Pane.Chat.Modal.show($.i18n._('callInvitationError'), true, false);
                    },
                30000);
                },
	
        _preprocessJingle = function (iq) {
            var sid = $(iq).find('jingle').attr('sid');
            var action = $(iq).find('jingle').attr('action');
	    try {
	    var conn = Candy.Core.getConnection();
	    _peerjid = iq.getAttribute('from');
	    _nick = Strophe.unescapeNode(Strophe.getResourceFromJid(_peerjid));
            //var sess = conn.jingle.sessions[sid];
            if (action == 'call-invitation') {
		var ack = $iq({type: 'result', to: iq.getAttribute('from'), id: iq.getAttribute('id') });
		var form_timeout = null;
		   Candy.View.Pane.Chat.Modal.show(Mustache.to_html(_Template.callConfirm, {
			_label: $.i18n._('labelCallConfirm', [_nick]),
			_labelYes: $.i18n._('labelYes'),
			_labelNo: $.i18n._('labelNo')
		   }));
		   $('#chat-modal').on('click', '#jingle-call-confirm-yes', function(e) {
			if (form_timeout) { clearTimeout(form_timeout); form_timeout = null;}
			Candy.View.Pane.Chat.Modal.hide();			
			Candy.View.Pane.Chat.Modal.show($.i18n._('calling'), false, true);
			_initiator = false;
			_callinvite_accepted_ack = ack.c('jingle', {xmlns: 'urn:xmpp:jingle:1', action: 'callinvite-accepted'});
		        getUserMediaWithConstraints(['audio', 'video']);
		
		   });
		   $('#chat-modal').on('click', '#jingle-call-confirm-no', function(e) {
			if (form_timeout) { clearTimeout(form_timeout); form_timeout = null;}
			Candy.View.Pane.Chat.Modal.hide();
        		ack.c('jingle', {xmlns: 'urn:xmpp:jingle:1', action: 'callinvite-denied'});
			conn.send(ack);
		   });
		   form_timeout = setTimeout(function() {
                   	Candy.View.Pane.Chat.Modal.hide();
        		ack.c('jingle', {xmlns: 'urn:xmpp:jingle:1', action: 'callinvite-denied'});
			conn.send(ack);
		   },20000);  
		return true;
            };
	    // ensure any other jingle won't pass unless we have sent an acknowledge of the call acceptance
	    if (_call_accepted_peerjid !=null && _peerjid !=null && _call_accepted_peerjid == _peerjid ) conn.jingle.onJingle.call(conn.jingle,iq);
		else {console.log("call was not accepted, ignore jingle action="+action);};
	    } catch(e) { console.log("error while preprocessing jingle="+e.stack);}
	    return true; 
        },
	self.init = function(srv) {
		Candy.View.Translation.en.labelCallConfirm = '"%s" wants a video call with you, accept?';
		Candy.View.Translation.en.labelYes = 'Yes';
		Candy.View.Translation.en.labelNo = 'No';
		Candy.View.Translation.en.calling = 'Establishing video call...';
		Candy.View.Translation.en.hangup = 'Hangup';
		Candy.View.Translation.en.callTerminated = 'Recipient terminated the call.';
		Candy.View.Translation.en.callInvitationSent = 'Sent call invitation, awaiting 30 seconds on response';
		Candy.View.Translation.en.callInvitationAccepted = 'Call invitation has been accepted, initiating the call';
		Candy.View.Translation.en.callInvitationDenied = 'Call invitation has been denied';
		Candy.View.Translation.en.callInvitationTimeout = 'Timeout on sending call invitation';
		Candy.View.Translation.en.callInvitationError = 'Error on sending call invitation ';
		Candy.View.Translation.en['jingleReason-service-unavailable'] = 'Recipient does not support video.';
		Candy.View.Translation.en['jingleReason-resource-constraint'] = 'Recipient is already in a call.';
    		RTC = setupRTC();
    		if (RTC !== null) {
		    	console.log("RTC had been initialized");
    		} else {
        		console.log('webrtc capable browser required');
			return false;
    		}
        	RTCPeerconnection = RTC.peerconnection;
		//RTCPeerconnection = TraceablePeerConnection;

		$(Candy).on('candy:core.chat.connection',function(event,p_status) {		  
			try {
			if (p_status.status == Strophe.Status.CONNECTED) {
			var conn = Candy.Core.getConnection();                                                               
			Candy.Core.getConnection().jingle.connection = Candy.Core.getConnection();
			conn.jingle.ice_config = srv;
        		conn.jingle.pc_constraints = RTC.pc_constraints;			
  			if (RTC.browser == 'firefox') {
      				conn.jingle.media_constraints.mandatory.MozDontOfferDataChannel = true;
  			}
                        if (conn.disco) {
                            conn.disco.addFeature('urn:xmpp:jingle:1');
                            conn.disco.addFeature('urn:xmpp:jingle:apps:rtp:1');
                            conn.disco.addFeature('urn:xmpp:jingle:transports:ice-udp:1');
                            conn.disco.addFeature('urn:xmpp:jingle:apps:rtp:audio');
                            conn.disco.addFeature('urn:xmpp:jingle:apps:rtp:video');
                            conn.disco.addFeature('urn:ietf:rfc:5761'); // rtcp-mux
                        }
			  conn.addHandler(_preprocessJingle, 'urn:xmpp:jingle:1', 'iq', 'set', null, null);
			}
			} catch (e) { console.log("error in connect event callback =>"+e);}
		});

                //---------------------------------------------------------------------
		$(document).bind('mediaready.jingle', function(event, stream) {
		  console.log("meadiaready event fired");
		  try {
			if (document.getElementById('jingle-remoteView') == null) { 
			  console.log("adding videopane for peer="+_peerjid+";nick="+_nick);
			  _addVideoPane(_peerjid,_nick); 			  
			} else {
			   console.log("remote element is already present");
			}
			var conn = Candy.Core.getConnection();
                  	conn.jingle.localStream = stream;
                  	RTC.attachMediaStream($('#jingle-localView'), stream);
			if (_initiator) {
				_session = conn.jingle.initiate(_peerjid,conn.jid);
				_call_accepted_peerjid = _peerjid;
			}
			else {
			   if (_callinvite_accepted_ack) {
			       conn.send(_callinvite_accepted_ack);
			       _callinvite_accepted_ack = null;
			       _call_accepted_peerjid = _peerjid;
			      //conn.jingle.onJingle.call(conn.jingle,_iq_preinit);
			   }
			}                                

		  } catch(e) {console.log("error while adding video pane =>"+e); return true;}
                });
	        
		//--------------------------------------------------------------------
               $(document).bind('callincoming.jingle', function(event, sid) {
                   //var from=sess.peerjid;		   
		   _session = Candy.Core.getConnection().jingle.sessions[sid];
		   _initiator = false;
		   _session.sendAnswer();
                   _session.accept();
                });
                $(document).bind('callterminated.jingle', function(event, sid, reason) {
			if (_showterminate) Candy.View.Pane.Chat.Modal.show($.i18n._('callTerminated'), true);
			_onTerminate(_peerjid);
                });
                $(document).bind('callactive.jingle', function(event, sid) {
			Candy.View.Pane.Chat.Modal.hide();
                });


                $(document).bind('remotestreamadded.jingle', function(event, data, sid) {
			if (document.getElementById('jingle-remoteView') == null) { 
			  _addVideoPane(_peerjid,_nick); 			  
			} 
			var conn = Candy.Core.getConnection();
        		function waitForRemoteVideo(selector, sid) {
            			var sess1 = conn.jingle.sessions[sid];
            			var videoTracks1 = sess1.remoteStream.getVideoTracks();
            			if (videoTracks1.length === 0 || selector.get(0).currentTime > 0 ) {  //
                			RTC.attachMediaStream(selector, data.stream); // FIXME: why do i have to do this for FF?
					$(document).trigger('callactive.jingle', [selector, sid]);
                		
            			} else {
                			setTimeout(function() { waitForRemoteVideo(selector, sid); }, 100);
            			}
        		}
			try {
                        var sel = $('#jingle-remoteView');
                        //sel.hide();
                        RTC.attachMediaStream(sel, data.stream);
        		waitForRemoteVideo(sel, sid);
			} catch (e) {console.log("error while adding remote stream =>"+e);};
        		console.log(data.stream);
        		data.stream.addEventListener('ended', function() {
            			console.log('stream ended');
				_onTerminate(_peerjid);
        		});
			
      		});
		$(document).bind('callaccepted.jingle', function(event, sid) {
			Candy.View.Pane.Chat.Modal.hide();
                });

      		$(document).bind('remotestreamremoved.jingle', function(event, data, sid) {
			$('#jingle-remoteView').hide();
        		// note that this isn't triggered when the peerconnection is closed
      		});
		
      		$(document).bind('ack.jingle', function (event, sid, ack) {
        		console.log('got stanza ack for ' + sid, ack);
    		});
		
    		$(document).bind('error.jingle', function (event, sid, err) {
        		console.log('got stanza error for ' + sid, err);
			console.log("error dump="+JSON.stringify(event)+";error="+JSON.stringify(err));
    		});
		/*
    		$(document).bind('packetloss.jingle', function (event, sid, loss) {
        		console.warn('packetloss', sid, loss);
    		});
    		*/
		$(Candy).on('candy:view.roster.context-menu', function(p_event,p_elem) {
		    console.log("context menu event called");
		    var jingle_menu_elem = {
		            requiredPermission: function(user, me) {
				//console.log('ch0,user='+JSON.stringify(user, null, 2));
		                return me.getNick() !== user.getNick() && !Candy.Core.getUser().isInPrivacyList('ignore', user.getJid()) && RTC;						
		            },
		            'class': 'jingle',
		            'label': 'Video call',
		            'callback': function(e, roomJid, user) {
						var rosterElem = $('#user-' + Candy.Util.jidToId(roomJid) + '-' + Candy.Util.jidToId(user.getJid()));
						_peerjid = user.getJid();							
						_nick = rosterElem.attr('data-nick');
						_sendCallInvitation();
		            }
		    };
		    p_elem.menulinks['jingle']	= jingle_menu_elem;
		});
	};

	return self;
}(CandyShop.Jingle || {}, Candy, jQuery));
