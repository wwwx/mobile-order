$(function() {
  var emitter = new EventEmitter()
  // 运行环境配置
  var Env = {
    baseUrl: {
      COMMON_QUERY: 'http://localhost:8083/commonquery'
    },
    init() {
      if (location.hostname.indexOf('icollecthw-commonquery') > -1) {
        this.baseUrl = {
          COMMON_QUERY:
            'http://icollecthw-commonquery-test1.niwodai.net/commonquery'
        }
      }
    }
  }

  var Utils = {
    // html模版替换
    substitute: function(tpl, data) {
      var result = tpl.replace(/{\s*([^}|\s]+)?\s*}/g, function(s0, s1) {
        return data[s1]
      })
      return result
    },
    // 界面toast提示
    toast: function(msg, duration) {
      duration = isNaN(duration) ? 3000 : duration
      var m = document.createElement('div')
      m.innerHTML = msg
      m.style.cssText =
        'font-family:siyuan;max-width:60%;min-width: 150px;padding: 10px 14px;color: rgb(255, 255, 255); text-align: center;border-radius: 4px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 16px;'
      document.body.appendChild(m)
      setTimeout(function() {
        var d = 0.5
        m.style.webkitTransition =
          '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in'
        m.style.opacity = '0'
        setTimeout(function() {
          document.body.removeChild(m)
        }, d * 1000)
      }, duration)
    },
    loading: (function() {
      var mask = document.createElement('div')
      mask.style.cssText =
        'display: none;position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 2000;background-color: rgba(0,0,0,.5);font-size: 16px;color: #fff; padding-top: 50%; text-align: center;'
      mask.innerText = 'Please wait...'
      document.body.appendChild(mask)
      return {
        open: function() {
          mask.style.display = 'block'
        },
        close: function() {
          mask.style.display = 'none'
        },
        remove: function() {
          document.body.removeChild(mask)
        }
      }
    })(),
    // 复制object
    clone: function(obj) {
      return JSON.parse(JSON.stringify(obj))
    },
    // 分页
    Pagination: function(option) {
      var self = this
      this.option = option
      // console.log($('#socialRelationship tbody').html())
      this.$container = $('#' + this.option.el)
      this.$footer = this.$container.find('.panel-footer')
      this.$previous = this.$container.find('.previous')
      this.$next = this.$container.find('.next')
      // console.log(option)

      this.handleDataChange = function() {
        // console.log(option)
        if (self.option.query.total <= self.option.query.size) {
          self.$footer.addClass('hide')
        } else {
          self.$footer.removeClass('hide')
        }

        if (self.option.query.current >= self.option.query.pages) {
          self.$next.addClass('disabled')
        } else {
          self.$next.removeClass('disabled')
        }

        if (self.option.query.current <= 1) {
          self.$previous.addClass('disabled')
        } else {
          self.$previous.removeClass('disabled')
        }
      }
      emitter.on(option.query.code, self.handleDataChange)
      // console.log('ok')
      // this.option.onchange()
      this.$previous.on('click', function() {
        if (self.option.query.current > 1) {
          ;(self.option.query.current -= 1), self.option.onchange()
        }
        // console.log(option.query.current)
      })
      this.$next.on('click', function() {
        if (self.option.query.current < self.option.query.pages) {
          ;(self.option.query.current += 1), self.option.onchange()
        }

        // console.log(option.query.current)
      })

      return this
    }
  }

  // 订单业务逻辑
  var Order = {
    _cameraId: '',
    commonParams: {
      cameraId: '',
      code: '',
      current: 1,
      size: 10
    },
    emergentContactParams: null,
    socialRelationshipParams: null,
    userParams: {
      cameraId: '',
      columnName: '',
      orderCondition: 'asc',
      current: 1,
      size: 10
    },
    // TODO: field 待修正
    userInfo: [
      {
        label: 'Name',
        field: 'realName'
      },
      {
        label: 'Gender',
        field: 'gender'
      },
      {
        label: 'Age',
        field: 'age'
      },
      {
        label: 'Mobile phone',
        field: 'mbPhone'
      },
      {
        label: 'Aadhar Card',
        field: 'aadharCard'
      },
      {
        label: 'BirthDate',
        field: 'birthDate'
      },
      {
        label: 'Address',
        field: 'address'
      },
      {
        label: 'Company Address',
        field: 'companyAddress'
      }
    ],
    $orderID: $('#orderID'),
    emergentContactPagination: null,
    socialRelationshipPagination: null,
    init: function() {
      this.bindEvent()
    },
    bindEvent: function() {
      var self = this
      // this.$orderID.trigger('click').focus()
      // 点击按钮查询
      $('#searchBtn').on('click', function() {
        if (self.$orderID.val().trim() === '') {
          Utils.toast('Please input Order ID')
          return
        }
        self.fetchUserInfo(function() {
          self.getEmergentContactList()
          self.getSocialRelationShipList()
        })
      })
    },
    responseHandler: function(response, callback) {
      if (response.code === '0') {
        callback(response.data)
      } else {
        Utils.toast(response.msg)
      }
    },
    commonQuery: function(url, params, callback) {
      Utils.loading.open()
      var self = this
      var config = {
        type: 'post',
        contentType: 'application/json;charset=utf-8',
        url: Env.baseUrl.COMMON_QUERY + url,
        data: JSON.stringify(params),
        timeout: 1000 * 8,
        success: function(response) {
          self.responseHandler(response, callback)
        },
        error: function(error) {
          // console.log(error)
          Utils.toast(error.statusText)
        },
        complete: function() {
          Utils.loading.close()
        }
      }
      $.ajax(config)
    },
    fetchUserInfo: function(callback) {
      var self = this
      this.commonQuery('/adapt/getUrgeLoanPageForH5', this.userParams, function(
        data
      ) {
        var json = data.records[0]
        var content = ''
        for (var i = 0; i < self.userInfo.length; i++) {
          var item = self.userInfo[i]
          item.value = json[item.field]
          content += Utils.substitute(self.htmlTemplate.UserInfo, item)
        }
        $('#customerIdentity .list').html(content)
        callback && callback()
      })
    },
    fetchCommonTable: function(elementId, data, template) {
      delete data.total
      delete data.pages
      this.commonQuery('/adapt/tab', data, function(result) {
        data.total = result.total
        data.pages = result.pages
        var content = ''
        for (var i = 0; i < result.body.length; i++) {
          content += Utils.substitute(template, result.body[i])
        }
        $('#' + elementId + ' tbody').html(content)
        // console.log(data.code)
        emitter.emit(data.code)
      })
    },
    getEmergentContactList: function() {
      var self = this
      var elementId = 'emergentContact'
      if (!this.emergentContactParams) {
        this.emergentContactParams = Utils.clone(this.commonParams)
      }
      this.emergentContactParams.current = 1
      this.emergentContactParams.code = 'tab_center_contact'
      if (!this.emergentContactPagination) {
        this.emergentContactPagination = new Utils.Pagination({
          el: elementId,
          query: self.emergentContactParams,
          onchange: function() {
            self.fetchCommonTable(
              elementId,
              self.emergentContactParams,
              self.htmlTemplate.EmergentContact
            )
          }
        })
      }
      this.emergentContactPagination.option.onchange()
    },
    getSocialRelationShipList: function() {
      const self = this
      var elementId = 'socialRelationship'
      if (!this.socialRelationshipParams) {
        this.socialRelationshipParams = Utils.clone(this.commonParams)
      }
      this.socialRelationshipParams.current = 1
      this.socialRelationshipParams.code = 'tab_center_addressbook'
      if (!this.socialRelationshipPagination) {
        this.socialRelationshipPagination = new Utils.Pagination({
          el: elementId,
          query: self.socialRelationshipParams,
          onchange: function() {
            self.fetchCommonTable(
              elementId,
              self.socialRelationshipParams,
              self.htmlTemplate.SocialRelationship
            )
          }
        })
      }
      this.socialRelationshipPagination.option.onchange()
    },
    htmlTemplate: (function() {
      return {
        EmergentContact: [
          '<tr>',
          '<td>{contactName}</td>',
          '<td>{relationValue}</td>',
          '<td>{contactPhone}</td>',
          '</tr>'
        ].join(''),
        SocialRelationship: [
          '<tr>',
          '<td>{displayName}</td>',
          '<td>{number}</td>',
          '</tr>'
        ].join(''),
        UserInfo: [
          '<li>',
          '<label>{label}:&nbsp;&nbsp;</label>',
          '<span>{value}</span>',
          '</li>'
        ].join('')
      }
    })()
  }

  Env.init()
  Order.init()
})
