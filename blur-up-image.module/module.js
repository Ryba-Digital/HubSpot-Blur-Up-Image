// Get all data-blur-up and data-auto-size elements
const blurUpImages = document.querySelectorAll('img[data-blur-up]');
const autoSizeImages = document.querySelectorAll('*[data-auto-size]');

// Set all blur-up image parents to overflow:hidden, so that the blur filter doesn't go beyond the bounds of the image itself
blurUpImages.forEach(image => {
    image.parentNode.style.overflow = "hidden";
});

// Determine the correct size the image *should* be based on the page layout, then apply the correct aspect ratio to get an optimized image
autoSizeImages.forEach(image => {
    const imageAspectRatio = image.height / image.width;
    const dataSrc = image.getAttribute("data-src");
    const fileName = dataSrc.split("/")[dataSrc.split("/").length - 1];
    // If the image is linked, the 'a' element will not have an inherent scroll width/height, so get the next parent.
    let parentWidth = 0;
    if (image.parentNode.scrollWidth > 0) {
        parentWidth = image.parentNode.scrollWidth;
    } else {
        parentWidth = image.parentNode.parentNode.scrollWidth;
    }
    // replate "hubsf" with "hub" to take advantage of HS's image resizing API, then get the image at 2x the intended size (for retina displays)
    const newSrc = dataSrc.replace('hubfs', 'hub') + `?width=${Math.round(parentWidth * 2)}&name=${fileName}`;
    image.setAttribute('width', parentWidth);
    image.setAttribute('height', Math.round(parentWidth * imageAspectRatio));
    image.setAttribute('data-src', newSrc);
})

// Watch for when images enter the viewport, then replace the source if needed and then add the "data-loaded" attribute
function watchImages() {
    let imageObserver = new IntersectionObserver((entries, imageObserver) => { 
    entries.forEach(entry => {
    if(entry.isIntersecting){
        if (entry.target.hasAttribute("data-src")) {
            entry.target.setAttribute("src", entry.target.getAttribute("data-src"));
        }
        setTimeout(() => {
            entry.target.setAttribute('data-loaded', '');
        }, 500)
        imageObserver.unobserve(entry.target);
    }
    });
    }, {rootMargin: "0px 0px -200px 0px"});
    blurUpImages.forEach(section => { imageObserver.observe(section) });
}

// On load, watch the images and add prefetch links for the auto-sized images
window.addEventListener("load", () => {
    watchImages();
    autoSizeImages.forEach(image => {
        const prefetchLink = document.createElement("link");
        prefetchLink.href = image.getAttribute("data-src");
        prefetchLink.rel = "prefetch";
        prefetchLink.as = "image";
        document.head.appendChild(prefetchLink);
    });
})