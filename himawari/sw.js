const gsidem2mapbox = function(data) {
  var length = data.length;
  for (var i = 0; i < length; i += 4) {
    data[i + 3] = data[i];
    data[i + 0] = 0xff;
    data[i + 1] = 0xff;
    data[i + 2] = 0xff;
  }
};

self.addEventListener('fetch', (event) => {

  if (!event.request.url.startsWith("https://www.jma.go.jp/bosai/himawari/data/satimg/")) return;
  if (!event.request.url.endsWith(".jpg")) return;
  console.log(event.request.url);
  event.respondWith(async function() {
    try {
      const res = await fetch(event.request.url);
      console.log(res);

      if (!res.ok) {
        //console.info("not ok", res);        return res;
      } else {
        //console.info("ok", res);
        const imageBitmap = await self.createImageBitmap(await res.blob());
        const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const context = canvas.getContext("2d");
        context.drawImage(imageBitmap, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        gsidem2mapbox(imageData.data);
        context.putImageData(imageData, 0, 0);
        return new Response(await canvas.convertToBlob(), {
          type: "image/png"
        });
      }
    } catch (e) {
      console.info("reject", e);
      throw e;
    };
  }());
});
