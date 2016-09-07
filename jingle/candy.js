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
		_callinvite_accepted_ack = null,
		_call_accepted_peerjid = null,
		_peerjid = null,		
		_nick = null,
		_showterminate = true,
		_iconsTimeout = null,
		_handleError = function(stanza) {
			var $stanza = $(stanza),
				reason = $stanza.children('error').firstChild;
			_displayError(reason);
			_onTerminate.call(Candy.Core.getConnection().jingle,$stanza.attr('from'));
		},
		_displayError = function(reason) {
			Candy.View.Pane.Chat.Modal.show($.i18n._('Communication error : '+reason), true);
		},
		_onTerminate = function(jid) {
			if (_peerjid && Candy.View.Pane.Chat.rooms[_peerjid]) Candy.View.Pane.Room.close(_peerjid);	
			try { 
			    if (Candy.Core.getConnection().jingle.jid2session.hasOwnProperty(_peerjid)) {
				var sid = Candy.Core.getConnection().jingle.jid2session[_peerjid].sid;
				Candy.Core.getConnection().jingle.terminate(sid);				 
			    }
			    
			} catch(e) {console.log("error while terminating session:"+e.stack);}
			if (Candy.Core.getConnection().jingle.localStream) {
  				Candy.Core.getConnection().jingle.localStream.getTracks().forEach(function (track) {
					console.log("stopping the track");
    					track.stop();
  				});
			}
			_initiator = false;			
			_peerjid = null;		
			_nick = null;
			_callinvite_accepted_ack = null;
			_call_accepted_peerjid = null;
			_showterminate = true;
		},
		_CallAcceptTemplate ='<strong>{{_label}}</strong>'
				+ '<p><button class="button" id="jingle-call-confirm-yes">{{_labelYes}}</button> '
				+ '<button class="button" id="jingle-call-confirm-no">{{_labelNo}}</button></p>';
	        _addVideoPane = function(jid,nick) {
		  Candy.View.Pane.PrivateRoom.open(jid, nick, true, false);
		  $('#chat-rooms > div[data-roomjid="' + jid + '"] > div.message-pane-wrapper').remove();
		  $('#chat-rooms > div[data-roomjid="' + jid + '"] > div.message-form-wrapper').remove();
		  $('#chat-rooms > div[data-roomjid="' + jid + '"]').append(
			  '<div id="jingle-videos">'
			+ '<video id="jingle-localView" autoplay="true"></video>'
			+ '<center><video id="jingle-remoteView" autoplay="true"></video></center>'

+ '  <div id="jingle-icons" class="hidden">'
+ '    <svg id="mute-audio" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewbox="-10 -10 68 68">'
+ '    <title>title</title>'
+ '      <circle cx="24" cy="24" r="34">'
+ '        <title>Mute audio</title>'
+ '      </circle>'
+ '      <path class="on" transform="scale(0.6), translate(17,18)" d="M38 22h-3.4c0 1.49-.31 2.87-.87 4.1l2.46 2.46C37.33 26.61 38 24.38 38 22zm-8.03.33c0-.11.03-.22.03-.33V10c0-3.32-2.69-6-6-6s-6 2.68-6 6v.37l11.97 11.96zM8.55 6L6 8.55l12.02 12.02v1.44c0 3.31 2.67 6 5.98 6 .45 0 .88-.06 1.3-.15l3.32 3.32c-1.43.66-3 1.03-4.62 1.03-5.52 0-10.6-4.2-10.6-10.2H10c0 6.83 5.44 12.47 12 13.44V42h4v-6.56c1.81-.27 3.53-.9 5.08-1.81L39.45 42 42 39.46 8.55 6z" fill="white"/>'
+ '      <path class="off" transform="scale(0.6), translate(17,18)"  d="M24 28c3.31 0 5.98-2.69 5.98-6L30 10c0-3.32-2.68-6-6-6-3.31 0-6 2.68-6 6v12c0 3.31 2.69 6 6 6zm10.6-6c0 6-5.07 10.2-10.6 10.2-5.52 0-10.6-4.2-10.6-10.2H10c0 6.83 5.44 12.47 12 13.44V42h4v-6.56c6.56-.97 12-6.61 12-13.44h-3.4z"  fill="white"/>'
+ '    </svg>'
+ '    <svg id="mute-video" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewbox="-10 -10 68 68">'
+ '      <circle cx="24" cy="24" r="34">'
+ '        <title>Mute video</title>'
+ '      </circle>'
+ '      <path class="on" transform="scale(0.6), translate(17,16)" d="M40 8H15.64l8 8H28v4.36l1.13 1.13L36 16v12.36l7.97 7.97L44 36V12c0-2.21-1.79-4-4-4zM4.55 2L2 4.55l4.01 4.01C4.81 9.24 4 10.52 4 12v24c0 2.21 1.79 4 4 4h29.45l4 4L44 41.46 4.55 2zM12 16h1.45L28 30.55V32H12V16z" fill="white"/>'
+ '      <path class="off" transform="scale(0.6), translate(17,16)" d="M40 8H8c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zm-4 24l-8-6.4V32H12V16h16v6.4l8-6.4v16z" fill="white"/>'
+ '    </svg>'
+ '    <svg id="fullscreen" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewbox="-10 -10 68 68">'
+ '      <circle cx="24" cy="24" r="34">'
+ '        <title>Enter fullscreen</title>'
+ '      </circle>'
+ '      <path class="on" transform="scale(0.8), translate(7,6)" d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z" fill="white"/>'
+ '      <path class="off" transform="scale(0.8), translate(7,6)"  d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z" fill="white"/>'
+ '    </svg>'
+ '    <svg id="hangup" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewbox="-10 -10 68 68">'
+ '      <circle cx="24" cy="24" r="34">'
+ '        <title>Hangup</title>'
+ '      </circle>'
+ '      <path transform="scale(0.7), translate(11,10)" d="M24 18c-3.21 0-6.3.5-9.2 1.44v6.21c0 .79-.46 1.47-1.12 1.8-1.95.98-3.74 2.23-5.33 3.7-.36.35-.85.57-1.4.57-.55 0-1.05-.22-1.41-.59L.59 26.18c-.37-.37-.59-.87-.59-1.42 0-.55.22-1.05.59-1.42C6.68 17.55 14.93 14 24 14s17.32 3.55 23.41 9.34c.37.36.59.87.59 1.42 0 .55-.22 1.05-.59 1.41l-4.95 4.95c-.36.36-.86.59-1.41.59-.54 0-1.04-.22-1.4-.57-1.59-1.47-3.38-2.72-5.33-3.7-.66-.33-1.12-1.01-1.12-1.8v-6.21C30.3 18.5 27.21 18 24 18z" fill="white"/>'
+ '    </svg>'
+ '  </div>'
			+ '</div>');
			$('#chat-tabs li[data-roomjid="' + jid + '"] a.close')
				.click(function() {
					_showterminate=false;
					_onTerminate.call(Candy.Core.getConnection().jingle,_peerjid);
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
				_onTerminate.call(Candy.Core.getConnection().jingle,_peerjid);
				Candy.View.Pane.Chat.Modal.show($.i18n._('callInvitationDenied'), true, false);				
			        break;
			 case 'callinvite-busy': 
				Candy.View.Pane.Chat.Modal.show($.i18n._('callInvitationBusy'), true, false);				
				_onTerminate.call(Candy.Core.getConnection().jingle,_peerjid);
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
		if (_callinvite_accepted_ack) {
			ack.c('jingle', {xmlns: 'urn:xmpp:jingle:1', action: 'callinvite-busy'});
			conn.send(ack);
			return;
		}
		var form_timeout = null;
		   Candy.View.Pane.Chat.Modal.show(Mustache.to_html(_CallAcceptTemplate, {
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
		Candy.View.Translation.en.callInvitationSent = 'Sent call invitation, awaiting 30 seconds on response.';
		Candy.View.Translation.en.callInvitationAccepted = 'Call invitation has been accepted, initiating the call.';
		Candy.View.Translation.en.callInvitationDenied = 'Call invitation has been denied.';
		Candy.View.Translation.en.callInvitationBusy = 'Recipient is already in a call.';
		Candy.View.Translation.en.callInvitationTimeout = 'Timeout on sending call invitation.';
		Candy.View.Translation.en.callInvitationError = 'Error on sending call invitation.';
    		RTC = setupRTC();
    		if (RTC !== null) {
		    	console.log("RTC had been initialized");
    		} else {
        		console.log('webrtc capable browser required');
			return false;
    		}
        	RTCPeerconnection = RTC.peerconnection;
		//RTCPeerconnection = TraceablePeerConnection;
		document.cancelFullScreen = document.webkitCancelFullScreen ||  document.mozCancelFullScreen || document.cancelFullScreen;
		document.body.requestFullScreen = document.body.webkitRequestFullScreen || document.body.mozRequestFullScreen || document.body.requestFullScreen;
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
			if (document.getElementById('jingle-remoteView') == null) { 
			  console.log("adding videopane for peer="+_peerjid+";nick="+_nick);
			  _addVideoPane(_peerjid,_nick); 			  
			} else {
			   console.log("remote element is already present");
			}
			var conn = Candy.Core.getConnection();
                  	conn.jingle.localStream = stream;
                  	RTC.attachMediaStream($('#jingle-localView'), stream);
			$('#jingle-icons').removeClass('hidden');
			if (_initiator) {
				conn.jingle.initiate(_peerjid,conn.jid);
				_call_accepted_peerjid = _peerjid;
			}
			else {
			   if (_callinvite_accepted_ack) {
			       conn.send(_callinvite_accepted_ack);
			       _callinvite_accepted_ack = null;
			       _call_accepted_peerjid = _peerjid;
			   }
			}                                
                });
	        
		//--------------------------------------------------------------------
               $(document).bind('callincoming.jingle', function(event, sid) {
		   var sess = Candy.Core.getConnection().jingle.sessions[sid];
		   _initiator = false;
		   sess.sendAnswer();
                   sess.accept();
                });
                $(document).bind('callterminated.jingle', function(event, sid, reason) {
			if (_showterminate) Candy.View.Pane.Chat.Modal.show($.i18n._('callTerminated'), true);
			_onTerminate.call(Candy.Core.getConnection().jingle,_peerjid);
                });
                $(document).bind('callactive.jingle', function() {
			console.log("inside callactive");
			try {
			Candy.View.Pane.Chat.Modal.hide();
                	$('#jingle-remoteView').addClass('active');
                        $('#jingle-localView').addClass('active');
			$('#jingle-remoteView').get(0).oncanplay = undefined;
                        $('#chat-rooms > div[data-roomjid="' + _peerjid + '"]').mousemove(function(event) {
			if (!$('#jingle-icons').hasClass('active')) {
			     $('#jingle-icons').addClass('active');
			     if(_iconsTimeout) clearTimeout(_iconsTimeout);
                             _iconsTimeout = setTimeout(function() { $('#jingle-icons').removeClass('active'); },5000);
                           }
                         });
			 if (Candy.Core.getConnection().jingle.localStream.getVideoTracks().length === 0) $('#mute-video').addClass('hidden');
			 if (Candy.Core.getConnection().jingle.localStream.getAudioTracks().length === 0) $('#mute-audio').addClass('hidden');

                         $('#jingle-icons').mouseenter(function(event) { if(_iconsTimeout) clearTimeout(_iconsTimeout); });
                         $('#jingle-icons').mouseleave(function(event) { 
			   if(_iconsTimeout) clearTimeout(_iconsTimeout);
                           _iconsTimeout = setTimeout(function() { $('#jingle-icons').removeClass('active'); },5000);
			});
			$('#mute-audio').click(function(event) {
					console.log('muteaudio click,event=>'+$(this).text());
                                        var audioTracks = Candy.Core.getConnection().jingle.localStream.getAudioTracks();
                                        for (var i = 0; i < audioTracks.length; ++i) {
                                          audioTracks[i].enabled = !audioTracks[i].enabled;
                                        }
					$('#mute-audio').get(0).classList.toggle('on');
			});
			$('#mute-video').click(function(event) {
					console.log('mutevideo click,event=>'+$(this).text());
                                        var videoTracks = Candy.Core.getConnection().jingle.localStream.getVideoTracks();
                                        for (var i = 0; i < videoTracks.length; ++i) {
                                          videoTracks[i].enabled = !videoTracks[i].enabled;
                                        }
					$('#mute-video').get(0).classList.toggle('on');
			});
  			$('#fullscreen').click(function() {
				$('#chat-rooms > div[data-roomjid="' + _peerjid + '"] > div.roster-pane').toggleClass('hidden');
				var room = $('#chat-rooms > div[data-roomjid="' + _peerjid + '"]');
				room.toggleClass('fullscreen');
				$('#fullscreen').get(0).classList.toggle('on');
				if (room.hasClass('fullscreen')) {
			    		document.querySelector('svg#fullscreen title').textContent = 'Exit fullscreen';
    					document.body.requestFullScreen();
				} else {
					document.querySelector('svg#fullscreen title').textContent = 'Enter fullscreen';
    					document.cancelFullScreen();
				}
			});
  			$('#hangup').click(function() { _showterminate=false; _onTerminate.call(Candy.Core.getConnection().jingle,_peerjid); });

		  } catch(e) {console.log("error while processing callactive =>"+e); console.log(e.stack); return true;}
                });

                $(document).bind('remotestreamadded.jingle', function(event, data, sid) {
			if (document.getElementById('jingle-remoteView') == null) { 
			  _addVideoPane(_peerjid,_nick); 			  
			} 
			var conn = Candy.Core.getConnection();
        		function waitForRemoteVideo() {
            			if ($('#jingle-remoteView').get(0).readyState >= 2) $(document).trigger('callactive.jingle');
            			 else $('#jingle-remoteView').get(0).oncanplay = waitForRemoteVideo.bind(this);
        		}

			try {
                        var sel = $('#jingle-remoteView');
                        //sel.hide();
                        RTC.attachMediaStream(sel, data.stream);
        		waitForRemoteVideo();
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
			//$('#jingle-remoteView').hide();
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
		                return me.getNick() !== user.getNick() && !Candy.Core.getUser().isInPrivacyList('ignore', user.getJid()) && RTC && !_peerjid;						
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
