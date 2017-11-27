const players = ['ESL_SC2', 'OgamingSC2', 'cretetion', 'freecodecamp',
 'storbeck', 'habathcx', 'RobotCaleb', 'noobs2ninjas'];
const ENDPOINT = 'https://wind-bow.glitch.me/twitch-api';
const BASEURL = 'https://www.twitch.tv/';


function Player(user, stream) {
  this.name = user.name;
  this.displayName = user.display_name;
  this.url = BASEURL + this.name;
  this.logo = user.logo;
  this._id = user._id;
  this.status = stream.stream ? 'online' : 'offline';
  this.streaming = stream.stream ? stream.stream.channel.status : 'Offline';
}


function TwitchViewModel() {
  let self = this;

  self.playersData = ko.observableArray([]);
  self.filteredData = ko.observableArray([]);

  // search value will be stored here
  self.query = ko.observable('');
  self.currentTab = ko.observable('all');

  // All Filters
  self.noFilter = function() {
    // no need to remove all items
    self.filteredData(self.playersData());
    self.currentTab('all');
  };

  // Online Filters
  self.onlineFilter = function() {
    const filter = self.playersData().filter(player => player.status == 'online');
    self.filteredData(filter);
    self.currentTab('online');
  };

  // Offline Filter
  self.offlineFilter = function() {
    const filter = self.playersData().filter(player => player.status == 'offline');
    self.filteredData(filter);
    self.currentTab('offline');
  };

  // add selected class
  self.currentTabSelectedAll = ko.pureComputed(function() {
    return self.currentTab() === 'all' ? 'twitch__filter-btn--selected' : '';
  }, self);

  // add selected class
  self.currentTabSelectedOnline = ko.pureComputed(function() {
    return self.currentTab() === 'online' ? 'twitch__filter-btn--selected' : '';
  }, self)

  // add selected class
  self.currentTabSelectedOffline = ko.pureComputed(function() {
    return self.currentTab() === 'offline' ? 'twitch__filter-btn--selected' : '';
  }, self)

  // whenever query is update run this function and filterd data
  self.searchFilter = ko.computed(function() {
    switch (self.currentTab()) {
      case 'online':
        self.onlineFilter();
        break;
      case 'offline':
        self.offlineFilter();
        break;
      default:
        self.noFilter()
        break;
    };
    const filter = self.filteredData().filter(player => {
      return player.displayName.toLowerCase().indexOf(self.query().toLowerCase()) !== -1
    });
    self.filteredData(filter);
  }, self);

  (function() {
    Promise
    .all(players.map(p => fetch(`${ENDPOINT}/users/${p}`)))
    .then(function(players) {
      return Promise.all(players.map(p => p.json()))
    })
    .then(function(players) {
      players.forEach(user => {
        fetch(`${ENDPOINT}/streams/${user.name}`)
        .then(p => p.json())
        .then(stream => {
          const player = new Player(user, stream);
          self.playersData.push(player);
        })
      })
    });
  })();
}

s = new TwitchViewModel();
ko.applyBindings(s);
