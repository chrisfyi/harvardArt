const BASE_URL = 'https://api.harvardartmuseums.org';
const KEY = 'apikey=7bf8b290-7a50-11ea-bbd0-e7883f0b077c'; // USE YOUR KEY HERE

function onFetchStart() {
  $('#loading').addClass('active');
}

function onFetchEnd() {
  $('#loading').removeClass('active');
}

async function fetchObjects() {
    const url = `${ BASE_URL }/object?${ KEY }`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  
  fetchObjects().then(x => console.log(x)); // { info: {}, records: [{}, {},]}


  async function fetchAllCenturies() {
    const url = `${ BASE_URL }/century?${ KEY }&size=100&sort=temporalorder`;
    
    if (localStorage.getItem('centuries')) {
        return JSON.parse(localStorage.getItem('centuries'));
      }

    try {
      const response = await fetch(url);
      const { records , info } = await response.json();
  
      return records;
    } catch (error) {
      console.error(error);
    }
  };
fetchAllCenturies();

async function fetchAllClassifications() {
    const url = `${ BASE_URL }/classification?${ KEY }&size=100&sort=name`;

    if (localStorage.getItem('classifiications')) {
        return JSON.parse(localStorage.getItem('classifications'));
    }
    try {
        const response = await fetch(url);
        const { records, info } = await response.json();
    
        return records;
      } catch (error) {
        console.error(error);
      }
}
fetchAllClassifications();

async function prefetchCategoryLists() {
    try {
      const  [
        classifications, centuries
      ] = await Promise.all([
        fetchAllClassifications(),
        fetchAllCenturies()
      ]);
    
    
    // This provides a clue to the user, that there are items in the dropdown
$('.classification-count').text(`(${ classifications.length })`);

classifications.forEach(classification => {
  // append a correctly formatted option tag into
  // the element with id select-classification
    $('#select-classification').append($(`<option value='${classification.name}'>'${classification.name}'</option>`))

});

// This provides a clue to the user, that there are items in the dropdown
$('.century-count').text(`(${ centuries.length }))`);

centuries.forEach(century => {
  // append a correctly formatted option tag into
  // the element with id select-century
  $('#select-century').append($(`<option value = '${century.name}'>' ${century.name}'</option>`))
});
  
} catch (error) {
    console.error(error);
  }}

  
 

function buildSearchString(){
  const classSelected =  $('#select-classification').val()
  const centurySelected = $('#select-century').val()
  const keywordEntered =  $('#keywords').val()

  const url = `${BASE_URL}/object?${KEY}&${classSelected}&${centurySelected}&${keywordEntered}`

  console.log(url)

return url;



}
buildSearchString()


$('#search').on('submit', async function (event) {
  // prevent the default
  event.preventDefault();
  onFetchStart()
  const url = buildSearchString()
  try {
    // get the url from `buildSearchString`
    // fetch it with await, store the result
     const response = await fetch(url)
     const {records , info} = await response.json();
     console.log(records)
    console.log(info)
     updatePreview(records, info)
   // log out both info and records when you get them
    
  } catch (error) {
    // log out the error
    console.error(error)
  } finally{
    onFetchEnd()
  }

});

function renderPreview(record) {
  // grab description, primaryimageurl, and title from the record
   
  const {primaryimageurl, description , title}  = record

  
  // Template looks like this:

  return $(`<div class="object-preview">
    <a href="#">
     ${primaryimageurl ? `<img src=" ${primaryimageurl}"/>` : ''}
      <h3>${title ? title : ''}</h3>
      <h3>${description ? description : ''}</h3>
    </a>
  </div>`).data('record', record)

// return $(`<div class="object-preview"> 
//   <a href="#"> ${
// if (title) { return <h3>${title}</h3>}
// else if (primaryimageurl) {return `<img src="${primaryimageurl}" />}
// else if (description) {return <h3>${description}</h3>
// else {return primaryimgurl && title }}
// </a> </div>`).data('record', record))
 
}

function updatePreview(records, info) {
  console.log(records)
  const root = $('#preview');
 
   if (info.next) {
    root.find('.next')
    .data('url', info.next)
    .attr('disabled' , false)
  }
  //   - on the .next button set data with key url equal to info.next
  //   - also update the disabled attribute to false
  // else
  else{
    root.find('.next')
    .data('url', null)
    .attr('disabled', true)
  }
  //   - set the data url to null
  //   - update the disabled attribute to true

 // Do the same for info.prev, with the .previous button
  if (info.prev) {
    root.find('.previous')
    .data('url', info.prev)
    .attr('disabled' , false)
  }else {
    root.find('.previous')
    .data('url', null)
    .attr('disabled', true)
  }
  // grab the results element, it matches .results inside root
  const resultsElement = root.find('.results');
  // empty it
  resultsElement.empty();
  // loop over the records, and append the renderPreview

  records.forEach( function(record) {
    resultsElement.append(renderPreview(record)
  )})
}

$('#preview .next, #preview .previous').on('click', async function () {
  onFetchStart();
 
    // read off url from the target 
    try {
      const url = $(this).data('url')
       // fetch the url
    const response = await fetch(url)
    // read the records and info from the response.json()
    const {records, info} = await response.json();
    updatePreview(records , info)
    } catch (err) {
      console.error(err)
    }
    finally{
    onFetchEnd() 
    }
});

$('#preview').on('click', '.object-preview', function (event) {
  event.preventDefault(); // they're anchor tags, so don't follow the link

  // find the '.object-preview' element by using .closest() from the target
      const previewObject = $(this).closest('.object-preview')

  // recover the record from the element using the .data('record') we attached
    const record = $(previewObject).data('record')
  // log out the record object to see the shape of the data
    console.log(record)
  // NEW => set the html() on the '#feature' element to renderFeature()
    const featureElement = $('#feature');
    featureElement.html(renderFeature(record))
});


function renderFeature(record) {
  /**
   * We need to read, from record, the following:
   * HEADER: title, dated
   * FACTS: description, culture, style, technique, medium, dimensions, people, department, division, contact, creditline
   * PHOTOS: images, primaryimageurl
   */

  // build and return template

  const {title , dated , description , culture, style, technique, medium, dimensions, people, department, division , contact, creditline , images, primaryimageurl} = record;
  
  console.log(record)

  return $(`<div class="object-feature"> 
    <header>
      <h3>${title}</h3>
      <h4>${dated}</h4>
    </header>
    <section class='facts'>
      ${factHTML('Culture' , culture , 'culture')} 
      ${factHTML('Description',description)}
      ${factHTML('Style' , style )}
      ${factHTML('Technique', technique , 'technique')}
      ${factHTML('Medium' , medium, 'medium')}
      ${factHTML('Dimensions' , dimensions)}
      ${factHTML('Department' , department)}
      ${factHTML('Division' , division)}
      ${ factHTML('Contact', `<a target="_blank" href="mailto:${ contact }">${ contact }</a>`) }
      ${factHTML('Creditline' , creditline)}
      ${record.people
        ? record.people.map(function(person) {
        return factHTML('Person', person.displayname, 'person');
        }).join('')
          : ''
        }
      ${photosHTML(images , primaryimageurl)}
      
      </div>`);
}


function searchURL(searchType, searchString) {
  return `${ BASE_URL }/object?${ KEY }&${ searchType}=${ searchString }`;
}

function factHTML(title,content,searchTerm = null){
  // if content is empty or undefined, return an empty string ''
    if (content = '') {
      return ''
    }

  // otherwise, if there is no searchTerm, return the two spans
    if(!searchTerm){
      return  `<span class="title">${title}</span>
      <span class= "content"> <a href ="${searchURL(searchTerm,content)}"></span>`
    }

   // otherwise, return the two spans, with the content wrapped in an anchor tag
    if (content & searchTerm){
      return `<span class="title">${title}</span>
      <span class= "content"> <a><a href ="${searchURL(searchTerm,content)}"></a> </span>`
    }
  }

function photosHTML(images, primaryimageurl) {
  // if images is defined AND images.length > 0, map the images to the correct image tags, then join them into a single string.  the images have a property called baseimageurl, use that as the value for src
  if(images & images.length > 0) {
    return images.map(image => 
      `<img src="${image.baseimageurl}/>`.join('')
    )
  }else if (primaryimageurl){
    return `<img src="${primaryimageurl}" />`
  }else {
    return ''
  }
// else if primaryimageurl is defined, return a single image tag with that as value for src
// else we have nothing, so return the empty string
}

$('#feature').on('click', 'a', async function (event) {
  // read href off of $(this) with the .attr() method
    const readObject = $(this).attr('href')
  // prevent default
  if(href.startsWith('mailto')) {return;}
    event.preventDefault();
  // call onFetchStart
    onFetchStart()  
  // fetch the href
      try {
        const response = await fetch(readObject)
        const {records , info} = await response.json() 
  // render it into the preview
        updatePreview(records, info)
      }catch (err){
        console.error(err)
      }finally {
        onFetchEnd()
      }
      // call onFetchEnd
});



prefetchCategoryLists()