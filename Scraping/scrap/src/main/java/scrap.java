/**
 * @author pablospl
 */
import java.io.PrintWriter;
import org.jsoup.Jsoup;
import org.jsoup.nodes.DataNode;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

//Linea 17 URL donde se encuentre la receta a obtener
//Linea 18 campos a obtener
//Linea 19 ruta donde guardar fichero
public class scrap {
    @SuppressWarnings("empty-statement")
    public static void main(String[] args) throws Exception{
           Document document = Jsoup.connect("https://www.recetasgratis.net/receta-de-cheesecake-vegano-facil-72413.html").get();
           Elements scripElements = document.select("script[type$=application/ld+json]");
           PrintWriter writer = new PrintWriter("/opt/recetarioCeliacos/cheesecacke.jsonld","UTF-8");
           for (Element element : scripElements) {
               for (DataNode node : element.dataNodes()) {                
                    writer.println(node.getWholeData());     
               }
           }          
           writer.close();          
    }
}
