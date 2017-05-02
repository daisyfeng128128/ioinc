/**
 * 通知Controllers
 * created by hwenbo
 * @time 2016-01-11
 */
angular.module('homeschool.Controllers', ['homeschool.CommonServices','mobiscroll-datetime','ionic','homeschool.Directives'])

.controller('teacherNoticeCtrl', function ($scope, $rootScope, $location,$filter ,$state ,$ionicHistory,$ionicLoading,$ionicActionSheet,authService, teacherNotice,$ionicPopup,$timeout,$animate) {
  if (typeof $rootScope.userGid == 'undefined' && getCookie('teacherGid') != null) {
      $rootScope.userGid = getCookie('teacherGid');
  }
  //置空问题反馈
  $scope.questionResult = "";
  //显示还是隐藏，true：显示收到的通知，false：显示发送的通知
  $scope.isshow = true;

  $scope.pageSize = 10;
  $scope.notice = [];//收到的通知list
  $scope.sendedNotice = [];//发送的通知list

  //page查询参数
  $scope.pageSetting = {
    receiveCurrentPage:1, //收到的通知当前页
    receiveTotalPage:0, //收到的通知page大小
    sendedCurrentPage:1, //发送的通知当前页
    sendedTotalPage:0 //发送的通知page大小
  }
  //错误显示参数
  $scope.res = {
    receiveNodata:false,
    receiveError:false,
    sendedNodata:false,
    sendedError:false
  }
  //通知搜索参数
  var searchData = {
    userGid:$rootScope.userGid,
    keyword:'',
    type:''
  }

  bindEvent();

  if ($rootScope.selectedId != undefined || $rootScope.selected != undefined) {
      $rootScope.selectedId = undefined;
      $rootScope.selected = undefined;
      $rootScope.selectedType = undefined;
  }

  $scope.$on('$stateChangeSuccess', function () {
    if ($rootScope.freshNotice == 1) {
        initData();
        $rootScope.freshNotice = undefined;
    }else{
        initData();//初始化数据
    }
  });
  //初始化数据
  function initData(){
    $scope.notice = []; //收到的通知list
    $scope.sendedNotice = []; //发送的通知list
    $scope.pageSetting.receiveCurrentPage = 1; //重置currentPage
    $scope.pageSetting.sendedCurrentPage = 1; //重置currentPage
    getReceiveNotice($scope.pageSetting.receiveCurrentPage); //查询收到的通知
    getSendedNotice($scope.pageSetting.sendedCurrentPage);   //查询发送的通知
  }

  //查询我收到的通知
  function getReceiveNotice(currentPage) {
    teacherNotice.getNotice($rootScope.userGid, currentPage, $scope.pageSize,
        function (success) {
          if (success) {
              $scope.pageSetting.receiveTotalPage = success.totalPage;
              $scope.notice = $scope.notice.concat(success.data);
              $scope.res.receiveNodata = false;
          }
          if (currentPage == 1 && $scope.notice == '') {
              $scope.res.receiveNodata = true;
          }else if ($scope.notice != '') {
              $scope.res.receiveNodata = false;
          }
        }, function (error) {
          if (currentPage == 1) {
              $scope.res.receiveNodata = false;
              $scope.res.receiveError = true;
          }
        });
  }

  function getSendedNotice(currentPage){
    teacherNotice.getMySendedNotice($rootScope.userGid, currentPage, $scope.pageSize,
        function (success) {
            if (success) {
                $scope.pageSetting.sendedTotalPage = success.totalPage;
                $scope.sendedNotice = $scope.sendedNotice.concat(success.data);
                $scope.res.sendedNodata = false;
            }
            if (currentPage == 1 && $scope.sendedNotice == '') {
                $scope.res.sendedNodata = true;
            }else if ($scope.sendedNotice != '') {
                $scope.res.sendedNodata = false;
            }
        }, function (error) {
          if (currentPage == 1) {
              $scope.res.sendedNodata = false;
              $scope.res.sendedError = true;
          }
        });
  }

  function bindEvent(){
      $scope.newDate = function (str) {
        return new Date(str);
      }
      $scope.toNoticeDetail = function (noticeGid) {
        $state.go("teachernoticedetail", {noticeGid: noticeGid, userGid: $rootScope.userGid});
      }
      //兼容ios格式化日期
      $scope.formatDate = function (str) {
        if (typeof(str) != 'undefined' && str != '' && str != 'null') {
        var oldDate = str.replace(/-/g,'/');
        var newDate = $filter('date')(new Date(oldDate),'yyyy-MM-dd');
        // console.log(newDate)
        return newDate;
        }
      }
      $scope.releaseNotice = function () {
        $ionicHistory.clearCache().then(function () {
            $rootScope.selectedId = undefined;
            $rootScope.selected = undefined;
            $rootScope.selectedType = undefined;
            $location.path('/releasenotice');
          });
      }
      $scope.searchNotice = function (keyword,isshow) {
        if(keyword == '') {

        }else if (keyword == 'clearcookie') {
          clearCookie('teacherGid');
          clearCookie('tOpenId');
          clearCookie('wxSchoolGid');
          alert('clear!');
        }else{
          if (isshow == true) {
            searchData.type = 2;
          }else{
            searchData.type = 1;
          }
          searchData.keyword = keyword;
          teacherNotice.searchNotice(searchData,
              function (success) {
                if (success) {
                   $scope.searchResult = success;
                }else{
                   $ionicLoading.show({template: '查询数据失败，请稍后重试', noBackdrop: true, duration: 2000});
                }
              }, function (error) {
                   $ionicLoading.show({template: '查询数据失败，请稍后重试', noBackdrop: true, duration: 2000});
              });
        }
        // $location.path('/teachernoticesearch');
      }
      
      //search pop
      $scope.TosearchNotice = function() {
          var myPopup = $ionicPopup.show({
            templateUrl: 'templates/popup_noticesearch.html',
            cssClass:'notice-search',
            scope: $scope
          });

          $timeout(function(){
            var animation = 'fadeIn';
            var popupElements = document.getElementsByClassName("popup-container")
            if (popupElements.length) {
                $scope.popupElement = angular.element(popupElements[0]);
                $scope.popupElement.addClass('animated')
                $scope.popupElement.addClass(animation)
            };
          }, 1)

          myPopup.then(function(res) {
          // console.log('Tapped!', res);
          });

          $scope.$on('$stateChangeSuccess', function () {
              myPopup.close();
          });

          //关闭pop
          $scope.closePopup = function(){
              var animation = 'fadeOut';
              var popupElements = document.getElementsByClassName("popup-container")
              if (popupElements.length) {
                  $scope.popupElement = angular.element(popupElements[0]);
                  $scope.popupElement.addClass('animated')
                  $scope.popupElement.addClass(animation)
              };
              $timeout(function(){
                myPopup.close();
              }, 400)

              if ($scope.searchResult) {
                $scope.searchResult = '';
              }
          }
      };

      /**
       * 显示还是隐藏，true：显示收到的通知，false：显示发送的通知
       * @param type 1--收到的通知，2--发送的通知
       */
      $scope.isActive = function(type) {
        if (type == 1 && !$scope.isshow) {
          $scope.isshow = !$scope.isshow;
        }
        if (type == 2 && $scope.isshow) {
          $scope.isshow = !$scope.isshow;
        }
      }

      $scope.loadMoreNotice = function (){
        if ($scope.isshow == true) {//我收到的
            $scope.pageSetting.receiveCurrentPage ++;
            getReceiveNotice($scope.pageSetting.receiveCurrentPage);
        }else if ($scope.isshow == false) {//我发送的
            $scope.pageSetting.sendedCurrentPage ++;
            getSendedNotice($scope.pageSetting.sendedCurrentPage);
        }

        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
      //下拉刷新
      $scope.refreshNotice = function () {
        if ($scope.isshow == true) {//我收到的
            $scope.notice = [];
            $scope.pageSetting.receiveCurrentPage = 1;
            getReceiveNotice($scope.pageSetting.receiveCurrentPage);
        }else if ($scope.isshow == false) {//我发送的
            $scope.sendedNotice = [];
            $scope.pageSetting.sendedCurrentPage = 1;
            getSendedNotice($scope.pageSetting.sendedCurrentPage);
        }

        $scope.$broadcast('scroll.refreshComplete');
      }
      //获取当前页
      $scope.getCurrentPage = function(){
        if ($scope.isshow == true) {
            if ($scope.notice.length > 0) {
                return $scope.pageSetting.receiveCurrentPage;
            }else{
              return 1;
            }
        }else if ($scope.isshow == false) {
            if ($scope.sendedNotice.length > 0) {
                return $scope.pageSetting.sendedCurrentPage;
            }else{
              return 1;
            }
        }
      }
      //返回pageSize
      $scope.getTotalPage = function(){
        if ($scope.isshow == true ) {
            if ($scope.notice.length > 0) {
              return $scope.pageSetting.receiveTotalPage;
            }else {
              return 1;
            }
        }else if ($scope.isshow == false) {
            if ($scope.sendedNotice.length > 0) {
              return $scope.pageSetting.sendedTotalPage;
            }else {
              return 1;
            }
        }
      }
  }
})

.controller('teacherNoticeDetailCtrl', function ($scope, $rootScope, $stateParams, $ionicLoading,$ionicActionSheet, $state, teacherNotice,$ionicScrollDelegate,authService ) {
  if ($stateParams.userGid) {
      authService.isModulePermission($stateParams.userGid, moduleCode.notice, function(data){
        if(data == null || data.isSuccess == 0){
          window.location.href = shoppingUrl;
        }
      }, function(data){
        window.location.href = shoppingUrl;
      });
  }
  $ionicLoading.show({template: 'Loading...'});
  //isExist
  $scope.isExist = true;
  //notice text
  $scope.isUnReadExpand = true;
  $scope.isReadedExpand = true;
  //通知类型
  $scope.noticeType = '';
  
  $scope.noticeGid = $stateParams.noticeGid;

  if (typeof($rootScope.userGid) == 'undefined') {
      $rootScope.userGid = $stateParams.userGid;
  }
  //获取通知详情
  teacherNotice.getNoticeDetail($stateParams.noticeGid, $rootScope.userGid,
    function (data) {
      $scope.noticeDetail = data;
      //获取通知图片
      if (typeof data != 'undefined' && data != '' && data != null) {
          $scope.noticeType = data.area;
          if (typeof data.fileUrl != 'undefined' && data.fileUrl != '') {
              $scope.noticePics = data.fileUrl;
              $scope.fileType = data.fileType;
              
              var files = $scope.noticePics.split(',');
              var types = $scope.fileType.split(',');
              
              
              for (var j = 0; j < files.length; j++) {
                files[j] = fileApi + files[j];
              }
              $scope.noticePics = files;
              $scope.html = "";
              $scope.htmlVoice = "";
              for (var j = 0; j < files.length; j++) {
            	if( types[j] == 0 ){
            		$scope.html += "<img src='" + $scope.noticePics[j] + "' class='notice-detail-img'  ng-click='previewImage(" +
                    j + ")' />";
            	}else if( types[j] == 1 ){
            		var tpm_voice = $scope.noticePics[j].replace("amr","mp3");
            		$scope.htmlVoice += "<audio controls id='voice' src='"+tpm_voice+"' class='notice-detail-audio'></audio>";
            	}
                
              }
          }
          if(data.appendix && data.appendix.length > 0){
              $scope.appendix = data.appendix;
          }
          $rootScope.freshNotice = 1;//刷新列表
      }else{
          $scope.isExist = false;
          angular.element('#null_notice').show();
      }
      
      $ionicLoading.hide();

      $scope.previewImage = function(j) {
        wx.previewImage({
          current: $scope.noticePics[j], // 当前显示图片的http链接
          urls: $scope.noticePics // 需要预览的图片http链接列表
        });
      }

    }, function (error) {
        angular.element('#null_notice').show();
        $ionicLoading.hide();
        $ionicLoading.show({template: '数据请求失败，请稍后重试', noBackdrop: true, duration: 2000});
    });
  //查询已读未读人员
  teacherNotice.findReadedOrNotPerson($stateParams.noticeGid,
    function (success) {
        $scope.noticeInfo = success;
        if (typeof success != 'undefined' && typeof success.read != 
          'undefined' && typeof success.notRead != 'undefined') {
            $scope.unread = success.notRead;
            $scope.read = success.read;
            if (success.notRead.length > 8) {
                $scope.unread = success.notRead.slice(0,8);
            }
            if (success.read.length > 8) {
                $scope.read = success.read;  
            }
        }
    }, function (error) {
        $ionicLoading.hide();
        $ionicLoading.show({template: '数据请求失败，请稍后重试', noBackdrop: true, duration: 2000});
    });

  //delete notice
  $scope.deleteNotice = function(id){
    var noticeId = id;
    $ionicActionSheet.show({
          titleText: '删除该条通知后，接收人将无法再查看到',
          // buttons:[
          //     {text:'确认删除'}   //index = 0
          // ],
          destructiveText:'确认删除',
          cancelText:'取消',
          cancel:function(){},
          destructiveButtonClicked :function(index){
                teacherNotice.deleteNotice(noticeId,
                      function(data){
                        if ('"true"' == data) {
                            $ionicLoading.show({template: '删除成功', noBackdrop: true, duration: 2000});
                            if ($stateParams.userGid == '') {
                                $rootScope.freshNotice = 1;
                                window.history.go(-1);
                            }else{
                                $state.go('teachernotice');
                            }
                        }else{
                            $ionicLoading.show({template: '删除失败', noBackdrop: true, duration: 2000});
                        }
                      },function(error){

                      });
                return true;
          }
    });
    
  }

  $scope.addFileHeadUrl = function (url) {
      if (typeof(url) == 'undefined') {
        return 'img/defaultPic.jpg';
      }
      return fileApi + url;
      //return 'http://localhost/filesRoot/file_temp/pic.jpeg';
  }
  //替换换行符 \n to <br>
  $scope.formatText = function (str) {
    if (typeof(str) != 'undefined' && str != '' && str != 'null') {
      // console.log(str)
    var newStr = str.replace(/\n/g,'<br>');
    newStr = newStr.replace(/\s/g,'&nbsp;')
    // console.log(newStr)
    return newStr;
    }
  }
  /**
   * 将时间字符串转为date object
   * @param str 时间字符串
   * @returns {Date}
   */
  $scope.newDate = function (str) {
    return new Date(str);
  }

  /*readinfo detail*/
  $scope.viewUnReadInfo = function(arr){
    var content = document.getElementById('notice_content');
    // var hr = document.getElementById('content_hr');
    var scrollValue = content.offsetHeight + 30;
 
    if (arr.length > 8 ) {
       if ($scope.isUnReadExpand == true) {
          $scope.unread = arr;
          $scope.isUnReadExpand = false;
          $ionicScrollDelegate.scrollTo(0,scrollValue);
       }else{
          $ionicScrollDelegate.scrollTo(0,0);
          $scope.unread = arr.slice(0,8);
          $scope.isUnReadExpand = true;
          $ionicScrollDelegate.scrollTo(0,0);
       }
    // $scope.$apply();
    }
  }

  /*readinfo detail*/
  $scope.viewReadInfo = function(arr){
    var unreadMem = document.getElementById('unreadMem');
    var content = document.getElementById('notice_content');

    var scrollValue =content.offsetHeight + unreadMem.offsetHeight + 40 + 30 + 10;
    // console.log(scrollValue)
    if (arr.length > 8 ) {
       if ($scope.isReadedExpand == true) {
          $scope.read = arr;
          $scope.isReadedExpand = false;
          $ionicScrollDelegate.scrollTo(0,scrollValue);
       }else{
          $scope.read = arr.slice(0,8);
          $scope.isReadedExpand = true;
          $ionicScrollDelegate.scrollTo(0,0);
       }
    // $scope.$apply(); 
    }
  }

  // 获取后缀名
  $scope.getFileExt = function(url){
      var name = url.split('.');
      var ext = name[name.length -1].toLowerCase();
      return ext;
  }

})

.controller('releaseNoticeCtrl', function ($scope, $location, $rootScope, $ionicLoading, $ionicHistory,$ionicPopover, $ionicActionSheet,$ionicBackdrop, $timeout, teacherNotice,$state) {
  
  $scope.isSuccess = false ;//防止重复提交验证
  $scope.isShowButton = true;	//isShowAddButton 
  
  $scope.readyShow = true;	//录音前的初始页面
  $scope.playShow = false;	//录音显示
  $scope.delShow = false;	//删除是否显示
  $scope.layerShow = false;	//自定义背景层
  $scope.playPause = true;	//录音播放
  $scope.recodMd = false;
  
  $scope.recordStage = 0;	//记录录音的阶段

  $scope.addContacts = function () {
    $ionicHistory.clearCache().then(function () {
        $location.path('/noticecontacts');
      });
  }

  //动态设置显示图片的html
  $scope.fileUrls = [];
  //语音URL
  $scope.fileVoiceUrl = [];
  //语音本地ID
  $scope.voiceLocalId = '';
  $scope.imgsHtml = '';
  $scope.localImgs = [];
  
  $scope.$on('$stateChangeSuccess', function () {
	  if($scope.recordStage === 1){
		  /*wx.stopVoice({
		    localId: $scope.voiceLocalId // 需要停止的音频的本地ID，由stopRecord接口获得
		  });*/
		  /*$timeout.cancel($scope.t);
		  $scope.del();*/
	  }
  });
//录音完毕
  function completeVoice(res){
	//显示声音
  	$scope.voiceLocalId = res.localId;
  	$scope.$apply();//这里需要手动通知一下
  	console.log("completeVoice");
  	  //先上传
	wx.uploadVoice({
	    localId: $scope.voiceLocalId, // 需要上传的音频的本地ID，由stopRecord接口获得
	    isShowProgressTips: 1, // 默认为1，显示进度提示
        success: function (res) {
        	console.log("成功")
        	//获取微信服务器的声音url
	        //$scope.fileVoiceUrl.push(res.serverId); // 返回音频的服务器端ID
	        $scope.fileVoiceUrl.push({fileUrl: res.serverId, fileName: ''});
	        console.log("$scope.fileVoiceUrl:"+$scope.fileVoiceUrl);

		  	if($scope.duration <= 60){
		  		$scope.saveTime = ($scope.duration-1)+"''";
		  	}
	        

	  	  	$timeout.cancel($scope.t);
	  	  
	  	  	$scope.readyShow = false; 
	  	  	$scope.playShow = true;
	  	    $scope.delShow =true;
	  	    $scope.playPause = true;
	  	  	$scope.$apply();
	  		$(".record-time").html($scope.saveTime);
	  		
	  		consoele.log($scope.playShow)
	  		
	    }
	});
	  
	
  }
  
  //点击松开 开始录音
  $scope.show = function() {
	  $scope.layerShow = true;	
	  $scope.recodMd = true;
	  $(".ready").show();
  };  
  
  $scope.duration = 0;	//录音时长
  $scope.t;	//录音定时器
  
  //开始录制语音
  $scope.startRecord = function(){ 
	  $scope.recordStage = 1;
	  $scope.readyShow = false;
	  $scope.recordShow = true;

	  $timeout.cancel($scope.t);
	  wx.startRecord();
	  console.log("startRecord");
	  $scope.timeCount();
  }
  
  //计时  
  $scope.timeCount = function(){
	  $scope.t = $timeout(function(){
		  $scope.timeCount()
	  },1000)
	  $scope.duration++;
	  
	  if($scope.duration < 10){
		  $(".time-num").html("0:0"+($scope.duration));
	  }else if($scope.duration <= 60){
		  $(".time-num").html("0:"+$scope.duration);
	  }else if($scope.duration>60){
		  $scope.stopRecord();
		  $timeout.cancel($scope.t);
	  }
	  
  }
  
  //停止录制语音
  $scope.stopRecord = function(){
	  $scope.recordStage = 2;
	  $scope.layerShow = false;	
	  $scope.recodMd = false;
	  wx.stopRecord({
	    success: function (res) {
			completeVoice(res);
	    }
	  });
	  
  }
  
  //删除录音
  $scope.del = function(){
	  $scope.playShow = false;
	  $scope.readyShow = true; 
	  $(".recording").hide();
	  $scope.duration = 0;
	  $scope.fileVoiceUrl=[];
	  wx.stopVoice({
	    localId: $scope.voiceLocalId // 需要停止的音频的本地ID，由stopRecord接口获得
	  });
  }
  
  
  
  //播放录制的语音
  $scope.playVoice = function(){
	  $scope.playPause = !$scope.playPause;
	  console.log('播放')
	  wx.playVoice({
	    localId: $scope.voiceLocalId // 需要播放的音频的本地ID，由stopRecord接口获得
	  });
  }
  
  //暂停录制播放
  $scope.pauseVoice = function(){
	  wx.pauseVoice({
	    localId: $scope.voiceLocalId // 需要暂停的音频的本地ID，由stopRecord接口获得
	  });
  }
  
  wx.onVoiceRecordEnd({
    // 录音时间超过一分钟没有停止的时候会执行 complete 回调
    complete: function (res) {
    	console.log("record auto stop:"+res);
    	completeVoice(res);
    }
  });
  
  
  function setImgHtml() {
    $scope.imgsHtml = "";

    for (var i = 0; i < $scope.localImgs.length; i++) {
      $scope.imgsHtml += "<img src='" + $scope.localImgs[i] + "' style='width:80px;height:80px;margin-right:5px;' ng-click='showPic(" +
        i + ")' />";
    }
    // $("#dirs").html($scope.imgsHtml);
    $scope.$apply();
  }

  // //图片的删除或预览操作
  $scope.showPic = function(i){
    var a = i;
    $ionicActionSheet.show({
          buttons:[
              {text:'预览'},  //index = 0
              {text:'删除'}   //index = 1
          ],
          cancelText:'取消',
          cancel:function(){},
          buttonClicked:function(index){
            switch(index){
              case 0:
                previewImage(a);
                return true;
              case 1:               
                deleteImg(a);
                return true;
            }
          }
      });
  }

  //预览
  function previewImage(i) {
    wx.previewImage({
      current: $scope.localImgs[i], // 当前显示图片的http链接
      urls: $scope.localImgs // 需要预览的图片http链接列表
    });
  }

  //删除选中的图片
  function deleteImg(i) {
    if ($scope.localImgs.length > i) {
      $scope.localImgs.splice(i, 1);
    }
    if ($scope.fileUrls.length > i) {
      $scope.fileUrls.splice(i, 1);
    }
    setImgHtml();
  }

    $scope.$watch('localImgs', function() {
      if ($scope.localImgs.length >= 9) {
          $scope.isShowButton = false;
      }else{
          $scope.isShowButton = true;
      }
    }, true);

  //拍照或选择图片
  $scope.startCamera = function (num) {
    var picNum = 9 - num;
    if ($scope.localImgs != undefined && $scope.localImgs.length < 9 && $scope.localImgs.length >=0) {
      wx.chooseImage({
        count: picNum, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {

          var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
          var temps=[];
          for (var i = 0; i < localIds.length; i++) {
            if ($scope.localImgs.indexOf(localIds[i]) != -1) {
              $ionicLoading.show({template: '此图片已添加', noBackdrop: true, duration: 2000});
            } else {
              $scope.localImgs.push(localIds[i]);
              temps.push(localIds[i])

            }
          }
          setImgHtml();
          if(temps.length>0){
            upload(temps);
          }
        }
      });
    } else {
      $ionicLoading.show({template: '最多只能选择9张图片', noBackdrop: true, duration: 2000});
    }

  }

  //上传图片，一次返回结果，再调下一次
  var upload = function (ids) {
    var id = ids.shift();
    wx.uploadImage({
      localId: id, // 需要上传的图片的本地ID，由chooseImage接口获得
      isShowProgressTips: 1, // 默认为1，显示进度提示
      success: function (res) {
        var serverId = res.serverId; // 返回图片的服务器端ID
        $scope.fileUrls.push({fileUrl: serverId, fileName: ''});
        // setImgHtml();
        if (ids.length > 0) {
          upload(ids);
        }
        
      },
      fail: function (res) {
        alert("上传图片失败");
        //alert(angular.toJson(res));
        var pos = $scope.localImgs.indexOf(id);
        if (pos != -1) {
          $scope.localImgs.splice(pos, 1);
        }
        setImgHtml();
        if (ids.length > 0) {
          upload(ids);
        }
      }
    });
  }
  
  $scope.sendNotice = function (noticeTitle, noticeText) {
    if (typeof($rootScope.selectedId) == 'undefined' || $rootScope.selectedId == '') {
      $ionicLoading.show({template: '请选择接收人', noBackdrop: true, duration: 2000});
    } else {
      $scope.isSuccess = true;
      $scope.selectedArry = [];

      //设置联系人数组
      for (var i = 0; i < $rootScope.selectedId.length; i++) {
        $scope.selectedArry[i] = {'personalGid': $rootScope.selectedId[i]};
      };

      $scope.selectedJson = JSON.stringify($scope.selectedArry);
      var fileUrls=angular.toJson($scope.fileUrls);//图片地址数组
      var voiceUrls = angular.toJson($scope.fileVoiceUrl);//图片地址数组

      teacherNotice.sendNotice(voiceUrls, fileUrls, $rootScope.userGid, noticeTitle, noticeText, $scope.selectedJson, $rootScope.schoolGid
        , function (success) {
          if (success == '') {
              $ionicLoading.show({template: '系统异常请稍后再试', noBackdrop: true, duration: 2000});
              $scope.isSuccess = false;
          } else {
              $scope.isSuccess = true;
          	  // console.log("请求成功："+success);
              if ($rootScope.selectedId.length == parseInt(angular.fromJson(success))) {
                  $ionicLoading.show({template: '通知发送成功', noBackdrop: true, duration: 2000});
                  $rootScope.selectedId = undefined;
                  $rootScope.selected = undefined;
                  $rootScope.selectedType = undefined;
                  $rootScope.freshNotice = 1;
                  window.history.go(-1);
              }else if (parseInt(angular.fromJson(success)) == -3){
                  $ionicLoading.show({template: '未获取到用户信息，请重新访问页面', noBackdrop: true, duration: 2000});
              }else if (parseInt(angular.fromJson(success)) == -2) {
                  $ionicLoading.show({template: '未获取到公众号信息，请重新访问页面', noBackdrop: true, duration: 2000});
              }else {
                  $ionicLoading.show({template: '通知发送异常', noBackdrop: true, duration: 2000});
                  window.history.go(-1);
              }

          }
        }, function (error) {
              $scope.isSuccess = false;
              $ionicLoading.show({template: '数据请求失败，请稍后重试', noBackdrop: true, duration: 2000});
        });
    }
  }

})
.controller('noticeContactsCtrl', function ($scope, $rootScope, selectContacts,$ionicLoading) {
    //显示还是隐藏，true：教职工，false：显示家长
    $scope.isshow = true;
    //显示部门还是联系人
    $scope.isShowList = true;
    //initContacts
    // $scope.allDepartMembers = {};
    // $scope.allDepartMembers.show = false;
    initDepart();
    initClass();
    /**
     * 显示还是教职工或家长
     * @param type 1--教职工，2--家长
     */
    $scope.isActive = function (type) {
      if (type == 1 && !$scope.isshow) {
        $scope.isshow = !$scope.isshow;
      }
      if (type == 2 && $scope.isshow) {
        $scope.isshow = !$scope.isshow;
      }
    }
    //搜索框显示事件
    $scope.showList = function (searchName){
        if (searchName == undefined || searchName == '') {
          if (typeof $scope.allDepartMembers != 'undefined') {
              $scope.allDepartMembers.show = false;
          }
          if (typeof $scope.allParents != 'undefined') {
              $scope.allParents.show = false;
          }
          $scope.isShowList = true;
        }else{
          if (typeof $scope.allDepartMembers != 'undefined') {
              $scope.allDepartMembers.show = true;
          }
          if (typeof $scope.allParents != 'undefined') {
              $scope.allParents.show = true;
          }
          $scope.isShowList = false;
        }
    }
    //确认选择
    $scope.selectMember = function (){
        window.history.go(-1);
    }

    //删除选中
    $scope.delSelected = function(item){
      if (typeof $rootScope.selected != 'undefined' && typeof $rootScope.selectedId != 'undefined' && $rootScope.selected != []) {
        var index = $rootScope.selected.indexOf(item)
        $rootScope.selected.splice(index, 1);
        $rootScope.selectedId.splice(index, 1);
        $rootScope.selectedType.splice(index, 1);
      }
    }

    $scope.toggleContact = function (con) {
      if (typeof con != 'undefined' && typeof con.show != 'undefined' && con.length != 0) {
          con.show = !con.show;
      }
    }

    $scope.isContactShown = function (con) {
      if (typeof con != 'undefined' && typeof con.show != 'undefined') {
        return con.show;
      } else {
        return false;
      }
    }

    //联系人组件选择事件
    function checkBoxEvent(){
        if (typeof $rootScope.selected == 'undefined') {
          $rootScope.selected = [];
        }

        if (typeof $rootScope.selectedId == 'undefined') {
          $rootScope.selectedId = [];
        }

        if (typeof $rootScope.selectedType == 'undefined') {
          $rootScope.selectedType = [];
        }
        var updateSelected = function (action, member) {
          var gid = getGidOrUserGid(member);
          var name = getRoleNameOrRelName(member);
          var index = $rootScope.selectedId.indexOf(gid);
          if (action == 'add' & index == -1){
            $rootScope.selected.push(name);
            $rootScope.selectedId.push(gid);
            $rootScope.selectedType.push(formatUserType(name));
          }
          if (action == 'remove' && index != -1){
            $rootScope.selected.splice(index, 1);
            $rootScope.selectedId.splice(index, 1);
            $rootScope.selectedType.splice(index, 1);
          }
        }

        $scope.updateSelection = function ($event, member) {
          $scope.searchName = '';
          var checkbox = $event.target;
          var action = (checkbox.checked ? 'add' : 'remove');
          updateSelected(action, member);
        };

        $scope.isSelected = function (member) {
          var gid = getGidOrUserGid(member);
          return $rootScope.selectedId.indexOf(gid) >= 0;
        };

        //选择全体教职工
        $scope.selectAll = function ($event,members) {
          var checkbox = $event.target;
          var action = (checkbox.checked ? 'add' : 'remove');
          for (var i = 0; i < members.length; i++) {
            var member = members[i];
            updateSelected(action, member);
          }
        };

        $scope.isSelectedAll = function (members) {
          var count = 0;
          if (typeof members != 'undefined') {
              for (var i = 0; i < members.length; i++) {   
                var member = members[i];
                var gid = getGidOrUserGid(member);
                if (contains($scope.selectedId, gid)) {
                  count++;
                }
              }
              return count === members.length;
          }
        };

    }

    //判断数组是否包含某一个值
    function contains(arr, val) {
      if (arr.indexOf(val) !== -1) {
        return true;
      } else {
        return false;
      }
    }

    //通知方法不同返回的用户gid字段不同
    function getGidOrUserGid(item){
      if (typeof item.userGid != 'undefined') {
         return item.userGid;
      }else if (typeof item.gid != 'undefined') {
         return item.gid;
      }
    }
    //通知方法不同返回的角色名称字段不同
    function getRoleNameOrRelName(item){
      if (typeof item.userName != 'undefined') {
         return item.userName;
      }else if(typeof item.relName != 'undefined'){
         return item.relName;
      }else if (typeof item.roleName != 'undefined') {
         return item.roleName;
      }
    }

    //初始化部门联系人
    function initDepart(){
        $ionicLoading.show({
            template: 'Loading...'
          });
        selectContacts.getAllDepartment($rootScope.userGid,
              function(data){
                $scope.allDepartment = data;
                if (typeof data != 'undefined' && data != '') {
                    for (var i = 0; i < data.length; i++) {
                      if (typeof data[i].departMem != 'undefined') {
                          data[i].departMem.show = false;  
                      }
                    }
                    checkBoxEvent();
                }
              },function(error){

              });

        selectContacts.getSchoolTeachers($rootScope.userSchoolGid,
              function(data){
                $scope.allDepartMembers = data;
                $scope.allDepartMembers.show = false;
                // console.log($scope.allDepartMembers)
                checkBoxEvent();
                $ionicLoading.hide();
              },function(error){

              });
    }
    //初始化班级联系人
    function initClass(){
        selectContacts.getAllClassAndParents($rootScope.userGid,
              function(data){
                $scope.allParents = [];
                $scope.classList = [];
                if (typeof data != 'undefined') {
                    $scope.classList = data;
                    for (var i = 0; i < data.length; i++) {
                      if (typeof data[i].parents != 'undefined') {
                        $scope.allParents = $scope.allParents.concat(data[i].parents);
                        $scope.classList[i].parents.show = false;
                      }
                    }
                    $scope.allParents.show = false;
                }
              },function(error){

              });
    }
})
