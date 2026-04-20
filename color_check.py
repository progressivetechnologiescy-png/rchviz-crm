from PIL import Image
import urllib.request
import io

def check_image(url, name):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            img = Image.open(io.BytesIO(response.read()))
            img = img.convert('RGBA')
            colors = img.getcolors(maxcolors=100000)
            if colors:
                # filter out transparent pixels
                opaque_colors = [c for c in colors if c[1][3] > 128]
                # sum all opaque pixels
                total_pixels = sum(c[0] for c in opaque_colors)
                if total_pixels == 0:
                    print(f'{name}: No opaque pixels')
                    return
                # count bright pixels (r > 200, g > 200, b > 200) -> nearly white
                white_pixels = sum(c[0] for c in opaque_colors if c[1][0] > 200 and c[1][1] > 200 and c[1][2] > 200)
                # count dark grey pixels (r < 100, g < 100, b < 100)
                dark_pixels = sum(c[0] for c in opaque_colors if c[1][0] < 100 and c[1][1] < 100 and c[1][2] < 100)
                print(f'{name}: White ratio: {white_pixels/total_pixels:.2f}, Dark ratio: {dark_pixels/total_pixels:.2f}')
    except Exception as e:
        print(f'{name}: Error: {e}')

check_image('https://progressivetechnologies.com.cy/wp-content/uploads/2024/03/progressivelogo.png', 'base')
check_image('https://progressivetechnologies.com.cy/wp-content/uploads/2024/03/progressivelogo-3.png', 'logo-3')
check_image('https://progressivetechnologies.com.cy/wp-content/uploads/2024/03/progressivelogo-4.png', 'logo-4')
