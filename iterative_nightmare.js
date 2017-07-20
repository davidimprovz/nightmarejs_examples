// requirements
const Nightmare = require('nightmare');
const fs = require('fs');

// pages to browse with a main selector
const url = 'http://www.nasdaq.com/markets/stocks/symbol-change-history.aspx';

/**
 * recursive Nightmare
 * TODO: need callback system
 */

// create js class to hold the data and links for inspection
function tickerChanges(selector, clicker){
	// set the browsing selectors
	this.selector = selector;
	this.clicker = clicker;

	// data bins
	this.data = []; 
	this.links = [];
	
	// setter methods
	var addData = (data) => this.data.append(data);
	var addLink = (link) => this.links.append(link);

	// getter methods
	var getData = () => this.data;
	var getLinks = () => this.links;
	
	// save data methods
	var saveData = () => {
		fs.writeFile('scraped_stockchange_data.js', JSON.stringify(this.data));
		// empty this.data to free memory
		return 'saved data!';
	}
	var saveLinks = () => {
		fs.writeFile('scraped_stockchange_links.js', JSON.stringify(this.links));
		// empty this.links to free memory
		return 'saved links!';
	}
}

function iterateNightmare(url){
  let nightmare = Nightmare({ show: false }); // get a nightmare instance

  nightmare.goto(url)
  	.evaluate(function() {
  		// check if there's a link to follow and add it to the stack
  		let obj = {
		    tableData: Array.from(document.querySelectorAll(changes.selector))
          					.map((element) => element.innerText),
		    nextPage: document.getElementById(changes.clicker)[0].href ? document.getElementsByClassName('next')[0].href : 'none',
	    }
    	return obj;
    })
    .end()
    .run(function(error, result, data_dock) { // get the results...data_dock is the changes class instance
      if (error) { console.error(error); } // look for errors
      else { // if no errs

        data_dock.addData(result.tableData); // use setter to append scraped data

        if (result.nextPage != 'none') { // if there are more pages	
        	data_dock.addLink(result.nextPage); // use setter to append scraped link
        	console.log( `Now scraping ${result.nextPage}` );
        	iterateNightmare(result.nextPage)
        }
        else {
        	console.log( `Scraped ${arr.length + 1} pages` ); // count out # of page scrapes
        	console.log( data_dock.saveData() ); // save the data to disk and report
        	console.log( data_dock.saveLinks() ); // save the links to disk and report
        }
      }
    }, changes)
    .catch(function(err){
    	if (err){ console.log(err); }
    });
}

// instantiate the class
const select = 'table.SymbolChangeList td'; // a collection of child elems
const clicker = 'two_column_main_content_lb_NextPage'; // an element id
var changes = new tickerChanges(select, clicker);

iterateNightmare(url);