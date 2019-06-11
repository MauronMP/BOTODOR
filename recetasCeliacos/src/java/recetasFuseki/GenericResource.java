/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package recetasFuseki;

import javax.ws.rs.PathParam;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.query.ResultSetFormatter;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import javax.ws.rs.core.MediaType;

/**
 * REST Web Service
 *
 * @author usuario
 */
@Path("recetario")
public class GenericResource {

    //Ruta del servidor de fuseki, indicando el nombre de dataset
    public String SERVICE_URI = "http://botodor.ignorelist.com:3030/recetasCeliacos"; 
    
    //Información de la consulta depende de la función
    public String consultaRealizada;
    
    //String que contiene los prefijos de las consultas
    public String prefijos="PREFIX schema: <http://schema.org/>" +"PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>" ;
    
    //Contacta con el servidor fuseki ubicado de manera local al cual envía la query
    //Posteriormente retorna la información
    //Se cambia a formato Json el resultado de la contulta y retornado a la función
    public static String preconsultaSparql(String SERVICE_URI, String query) {
            List<String> usuarios = new ArrayList(); 
            QueryExecution q = QueryExecutionFactory.sparqlService(SERVICE_URI,query);
            ResultSet results = q.execSelect(); 
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                ResultSetFormatter.outputAsJSON(outputStream, results);
                String json= new String(outputStream.toByteArray());
        System.out.println(json);
        return (json);
    }
    
    //Todas las recetas
    @Path("/recetas")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerRecetas() { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT ?nombreReceta ?imagen\n"+
            "WHERE {"+
                "?name schema:name ?nombreReceta."+
                "?name schema:image ?imagen"+
            "}");
        return consultaRealizada;
    }  
    
    //Cantidad limitada de recetas
    @Path("/recetaslimitadas/{number}/recetas")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerRecetasLimitadas(@PathParam("number") int number){ 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+              
            "SELECT ?nombreReceta ?imagen\n"+
            "WHERE {"+
                "?name schema:name ?nombreReceta."+
                "?name schema:image ?imagen"+
            "}"+
            "ORDER BY RAND() Limit"+number+"");
        return consultaRealizada;
    }  
    
    //Recetas con un ingrediente
    @Path("/{tipoIngrediente}/recetas")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerRecetasConIngrediente(@PathParam("tipoIngrediente") String tipoIngrediente){
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
        "SELECT ?nombreReceta ?imagen\n"+
            "WHERE {"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen\n"+
                    "FILTER EXISTS {"+
                        "?name schema:recipeIngredient ?Ingredientes\n"+
                        "FILTER (CONTAINS(?Ingredientes,"+"\""+tipoIngrediente+"\""+"))\n"+
                    "}"
            + "}");
        return consultaRealizada; 
    }
    
    //Cantidad limitada de recetas con ingrediente
    @Path("/ingredinteLimitadoReceta/{tipoIngrediente}/afirmacion/recetas/{number}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerRecetasConIngredienteLimitado(@PathParam("tipoIngrediente") String tipoIngrediente, @PathParam("number") int number){
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+           
        "SELECT ?nombreReceta ?imagen\n"+
        "WHERE {\n"+
            "?name schema:name ?nombreReceta.\n"+
            "?name schema:image ?imagen\n" +
            "FILTER  EXISTS {"+
                "?name schema:recipeIngredient ?Ingredientes\n"+
                "FILTER (CONTAINS(?Ingredientes,"+"\""+tipoIngrediente+"\""+"))\n"+
                "}"+
        "}"+
        "ORDER BY RAND() Limit"+number+"");
        return consultaRealizada;
    }
   
    //Receta sin ingrediente
    @Path("/{tipoIngrediente}/{negacion}/recetas")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerRecetasSinIngrediente(@PathParam("tipoIngrediente") String tipoIngrediente, @PathParam("negacion") String negacion){
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT ?nombreReceta ?imagen\n" +
            "WHERE {\n" +
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen\n"+
                "FILTER NOT EXISTS {"+
                    "?name schema:recipeIngredient ?Ingredientes\n"+
                    "FILTER (CONTAINS(?Ingredientes,"+"\""+tipoIngrediente+"\""+"))\n"+
                "}"+
            "}");
        return consultaRealizada;
    }

    //Cantidad limitada sin ingrediente
    @Path("/ingredinteLimitadoReceta/{tipoIngrediente}/negacion/recetas/{number}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerRecetasSinIngredienteLimitado(@PathParam("tipoIngrediente") String tipoIngrediente, @PathParam("number") int number){       
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+         
            "SELECT ?nombreReceta ?imagen\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n" +
                "?name schema:image ?imagen\n" +
                "FILTER NOT EXISTS {"+
                    "?name schema:recipeIngredient ?Ingredientes\n"+
                        "FILTER (CONTAINS(?Ingredientes,"+"\""+tipoIngrediente+"\""+"))\n"+
                "}"+
            "} ORDER BY RAND() Limit"+number+"");
        return consultaRealizada;
    }
    
    //Descripciones
    @Path("/descripciones")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerDescripcionRecetas() { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT ?nombreReceta ?descripcion ?imagen\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:description ?descripcion.\n"+
                "?name schema:image ?imagen\n"+
            "}");
        return consultaRealizada;
    }  
    
    //Descripcion<--->receta
    @Path("/descripcionRecetaEspecifica/{nombreReceta}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerMostrarDescripcionRecetaEspecifica(@PathParam("nombreReceta") String nombreReceta) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?imagen ?descripcion\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:description ?descripcion.\n"+
                    "FILTER regex(?nombreReceta,"+"\""+nombreReceta+"\""+","+"\"i\""+")"+
            "}");
        return consultaRealizada;    
    } 
   
    //Descripciones con ingrediente
    @Path("/descripcionesConIngredientes/{tipoIngrediente}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerDescripcionConIngredienete (@PathParam("tipoIngrediente") String tipoIngrediente) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT ?nombreReceta ?descripcion ?imagen\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:description ?descripcion.\n"+
                "?name schema:image ?imagen\n"+
                    "FILTER  EXISTS {"+
                        "?name schema:recipeIngredient ?Ingredientes\n"+
                        "FILTER (CONTAINS(?Ingredientes,"+"\""+tipoIngrediente+"\""+"))\n"+
                    "}"+
            "}");
        return consultaRealizada; 
    } 
    
    //Descripcion con ingredientes cantidad limitada
    @Path("/descripcionesConIngredientesAlgunos/{tipoIngrediente}/{number}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerDescripcionAlgunosConIngredienete(@PathParam("tipoIngrediente") String tipoIngrediente,@PathParam("number") int number) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT ?nombreReceta ?descripcion ?imagen\n"+
                "WHERE {\n"+
                    "?name schema:name ?nombreReceta.\n"+
                    "?name schema:description ?descripcion.\n"+
                    "?name schema:image ?imagen\n"+
                        "FILTER EXISTS {"+
                            "?name schema:recipeIngredient ?Ingredientes\n"+
                            "FILTER (CONTAINS(?Ingredientes,"+"\""+tipoIngrediente+"\""+"))\n"+
                        "}"+
                "}"+
                "ORDER BY RAND() Limit"+number+"");
        return consultaRealizada;
    } 
    
    //Descripciones sin ingredientes
    @Path("/descripcionesSinIngredientes/{tipoIngrediente}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerDescripcionSinIngredienete(@PathParam("tipoIngrediente") String tipoIngrediente) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT ?nombreReceta ?descripcion ?imagen\n" +
            "WHERE {\n" +
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:description ?descripcion.\n"+
                "?name schema:image ?imagen\n"+
                    "FILTER NOT EXISTS {"+
                        "?name schema:recipeIngredient ?Ingredientes\n"+
                        "FILTER (CONTAINS(?Ingredientes,"+"\""+tipoIngrediente+"\""+"))\n"+
                    "}"+
            "}");
        return consultaRealizada;
    } 
    
    //Descripcion sin ingredientes cantidad limitada
    @Path("/descripcionesSinIngredientesAlgunos/{tipoIngrediente}/{number}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerDescripcionAlgunosSinIngredienete(@PathParam("tipoIngrediente") String tipoIngrediente,@PathParam("number") int number) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT ?nombreReceta ?descripcion ?imagen\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:description ?descripcion.\n"+
                "?name schema:image ?imagen\n"+
                    "FILTER  NOT EXISTS {"+
                        "?name schema:recipeIngredient ?Ingredientes\n"+
                        "FILTER (CONTAINS(?Ingredientes,"+"\""+tipoIngrediente+"\""+"))\n"+
                    "}"+
            "}"+
            "ORDER BY RAND()  Limit"+number+"");
        return consultaRealizada;
    }
    
    //Descripcion<--->categoria
    @Path("/getDescripcionPorCategoria/Especifica/{tipoCategorias}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerDescripcionPorCategoriaEspecifica(@PathParam("tipoCategorias") String tipoCategorias) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?imagen ?descripcion\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:description ?descripcion.\n"+
                "?name schema:recipeCategory ?categoriaReceta.\n" +
                    "FILTER(?categoriaReceta="+"\""+tipoCategorias+"\""+")"+
            "}");
        return consultaRealizada;
    } 
    
    //Recetas tiempo>X
    @Path("/elaboracionRecetaMayorDe/{tiempoMin}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerDescripcionRecetasMayorDeTiempo(@PathParam("tiempoMin") int tiempoMin) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?descripcion ?imagen ?tiempoTotal\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:description ?descripcion.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:totalTime ?tiempoTotal.\n"+
                   "FILTER(xsd:integer(?tiempoTotal) >="+tiempoMin+")"+
            "}");
        return consultaRealizada;
    } 
    
    //Recetas tiempo<X
    @Path("/elaboracionRecetaMenorDe/{tiempoMin}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerDescripcionRecetasMenorDeTiempo(@PathParam("tiempoMin") int tiempoMin) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?descripcion ?imagen ?tiempoTotal\n" +
            "WHERE {\n" +
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:description ?descripcion.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:totalTime ?tiempoTotal.\n"+
                    "FILTER(xsd:integer(?tiempoTotal) <="+tiempoMin+")"+
            "}");
        return consultaRealizada;
    } 
    
    //Recetas<--->Categoria
    @Path("/recetasPorTipoCategoria/{tipoCategorias}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerRecetasPorCategoria(@PathParam("tipoCategorias") String tipoCategorias) {        
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?categoriaReceta ?imagen \n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:recipeCategory ?categoriaReceta.\n" +
                    "FILTER(?categoriaReceta="+"\""+tipoCategorias+"\""+")"+
            "}");
        return consultaRealizada;
    } 
        
    //Descripcion cantidad limitada
    @Path("/getDescripcion/Limitadas/{number}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerDescripcionesLimitadas(@PathParam("number") int number) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT ?nombreReceta ?imagen ?descripcion\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:description ?descripcion.\n"+
            "}"+
            "ORDER BY RAND() Limit"+number+"");
        return consultaRealizada;
    }  
  
    //Categorias
    @Path("/categoriasRecetas")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerCategoriasRecetas() { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT ?categoria \n"+
            "WHERE {\n"+
                "?name schema:recipeCategory ?categoria.\n"+
            "}"+
            "GROUP BY ?categoria");
        return consultaRealizada;
    } 
    //Categorias de cada receta
    @Path("/categorias/asociadasACadaRecetas")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerCategoriasDeCadaRecetas() { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?categoriaReceta ?imagen \n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:recipeCategory ?categoriaReceta.\n"+

            "}");
        return consultaRealizada;
    }
    
    //Categoria específica cantidad limitada con ingredientes
    @Path("/getCategoriaEspecificaConIngredienteLimitadaCantidadRecetas/{tipoIngrediente}/{tipoCategorias}/{number}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerCategoriaEspecificaConIngredienteLimitadaCantidadRecetas(@PathParam("tipoIngrediente") String tipoIngrediente,@PathParam("tipoCategorias") String tipoCategorias,@PathParam("number") int number) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?categoriaReceta ?imagen \n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:recipeCategory ?categoriaReceta.\n"+
                    "FILTER(?categoriaReceta="+"\""+tipoCategorias+"\""+")"+
                    "FILTER  EXISTS {"+
                        "?name schema:recipeIngredient ?Ingredientes\n"+
                        "FILTER (CONTAINS(?Ingredientes,"+"\""+tipoIngrediente+"\""+"))"+
                    "}\n"+
            "}"+
            "ORDER BY RAND() Limit"+number+"");
        return consultaRealizada;
    } 
    
    //Categoria específica cantidad limitada sin ingredientes
    @Path("/getCategoriaEspecificaSinIngredienteLimitadaCantidadRecetas/{tipoIngrediente}/{tipoCategorias}/{number}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerCategoriaEspecificaSinIngredienteLimitadaCantidadRecetas(@PathParam("tipoIngrediente") String tipoIngrediente,@PathParam("tipoCategorias") String tipoCategorias,@PathParam("number") int number) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?categoriaReceta ?imagen \n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:recipeCategory ?categoriaReceta.\n"+
                    "FILTER(?categoriaReceta="+"\""+tipoCategorias+"\""+")"+
                    "FILTER  NOT EXISTS {"+
                        "?name schema:recipeIngredient ?Ingredientes\n"+
                        "FILTER (CONTAINS(?Ingredientes,"+"\""+tipoIngrediente+"\""+"))"+
                    "}\n"+
            "}"+
            "ORDER BY RAND() Limit"+number+"");
        return consultaRealizada;
    } 
    
    //Recetas tiempo
    @Path("/getRecetasTiempoElaboracion")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerRecetasTiempo() { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?imagen ?tiempoTotal\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:totalTime ?tiempoTotal.\n"+
            "}");
        return consultaRealizada;
    } 
    
    //Categoria especifica sin ingrediente
    @Path("/categoriasEspecificasSinIngrediente/{tipoIngrediente}/{tipoCategorias}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerCategoriasEspecificasSinIngrediente(@PathParam("tipoIngrediente") String tipoIngrediente,@PathParam("tipoCategorias") String tipoCategorias) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?categoriaReceta ?imagen \n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:recipeCategory ?categoriaReceta.\n"+
                    "FILTER(?categoriaReceta="+"\""+tipoCategorias+"\""+")"+
                    "FILTER  NOT EXISTS {"+
                        "?name schema:recipeIngredient ?Ingredientes\n"+
                        "FILTER (CONTAINS(?Ingredientes,"+"\""+tipoIngrediente+"\""+"))"+
                "}\n"+
            "}");
        return consultaRealizada;
    } 
    
    //Categoria especifica con ingrediente
    @Path("/categoriasEspecificasConIngrediente/{tipoIngrediente}/{tipoCategorias}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerCategoriasEspecificasConIngrediente(@PathParam("tipoIngrediente") String tipoIngrediente,@PathParam("tipoCategorias") String tipoCategorias) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?categoriaReceta ?imagen \n"+
            "WHERE {\n"+
             "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:recipeCategory ?categoriaReceta.\n"+
                    "FILTER(?categoriaReceta="+"\""+tipoCategorias+"\""+")"+
                    "FILTER EXISTS {"+
                        "?name schema:recipeIngredient ?Ingredientes\n"+
                        "FILTER (CONTAINS(?Ingredientes,"+"\""+tipoIngrediente+"\""+"))"+
                "}\n"+
            "}");
        return consultaRealizada;
    } 
    
    //Categoria especifica tiempo<X
    @Path("/getCategoriaEspecificaEnFuncionTiempoMenorX/{tipoCategorias}/{tiempoMin}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerCategoriaEspecificaEnFuncionTiempoMenorX(@PathParam("tipoCategorias") String tipoCategorias,@PathParam("tiempoMin") int tiempoMin) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos +
            "SELECT DISTINCT ?nombreReceta ?imagen ?tiempoTotal\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:totalTime ?tiempoTotal.\n"+
                "?name schema:recipeCategory ?categoriaReceta.\n"+
                    "FILTER(?categoriaReceta="+"\""+tipoCategorias+"\""+")"+
                    "FILTER(xsd:integer(?tiempoTotal) <="+tiempoMin+")"+
            "}");
        return consultaRealizada;
    } 
    
    //Categoria especifica tiempo>X
    @Path("/getCategoriaEspecificaEnFuncionTiempoMayorX/{tipoCategorias}/{tiempoMin}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerCategoriaEspecificaEnFuncionTiempoMayorX(@PathParam("tipoCategorias") String tipoCategorias,@PathParam("tiempoMin") int tiempoMin) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?imagen ?tiempoTotal\n" +
            "WHERE {\n" +
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:totalTime ?tiempoTotal.\n"+
                "?name schema:recipeCategory ?categoriaReceta.\n"+
                    "FILTER(?categoriaReceta="+"\""+tipoCategorias+"\""+")"+
                    "FILTER(xsd:integer(?tiempoTotal) >="+tiempoMin+")"+
            "}");
        return consultaRealizada;
    }
    
    //Tiempo recetas categoria especifica
    @Path("/tiempoRealizarCategoriaEspecifica/{tipoCategorias}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerTiempoRealizarCategoriaEspecifica(@PathParam("tipoCategorias") String tipoCategorias) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?imagen ?tiempoTotal\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:totalTime ?tiempoTotal.\n"+
                "?name schema:recipeCategory ?categoriaReceta.\n"+
                   "FILTER(?categoriaReceta="+"\""+tipoCategorias+"\""+")"+
            "}");
        return consultaRealizada;
    } 
   
    //Ingredientes receta específica
    @Path("/getMostrarIngredientesDeUnaReceta/{nombreReceta}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerMostrarIngredientesDeUnaReceta(@PathParam("nombreReceta") String nombreReceta) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?imagen ?ingredientes\n"+
            "WHERE {\n" +
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:recipeIngredient ?ingredientes.\n"+
                "FILTER regex(?nombreReceta,"+"\""+nombreReceta+"\""+","+"\"i\""+")"+
            "}");
        return consultaRealizada;
    } 
    
    //Pasos receta específica
    @Path("/getMostrarPasosRecetaEspecifica/{nombreReceta}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerMostrarPasosDeUnaReceta(@PathParam("nombreReceta") String nombreReceta) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?imagen ?pasosRealizar\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:text ?pasosRealizar.\n"+
                    "FILTER regex(?nombreReceta,"+"\""+nombreReceta+"\""+","+"\"i\""+")"+
            "}");
        return consultaRealizada;    
    } 
    
    //Pasos todas recetas
    @Path("/getMostrarPasosTodasRecetas")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerIngredientesRecetas() {
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?imagen ?pasosRealizar\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:text ?pasosRealizar.\n"+
            "}"+
            "ORDER BY ?nombreReceta");      
        return consultaRealizada;   
    }
          
    //Ingredientes todas recetas
    @Path("/getMostrarIngredientesRecetas")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerIngredientesRecetas(@PathParam("nombreReceta") String nombreReceta){ 
       consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?nombreReceta ?imagen ?ingredientes\n"+
            "WHERE {\n"+
                "?name schema:name ?nombreReceta.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:recipeIngredient ?ingredientes.\n"+             
            "}"+
            "ORDER BY ?nombreReceta");        
        return consultaRealizada;   
    } 
        
    //DATOS COMPLETOS UNA RECETA ESPECIFICA
    @Path("/getMostrarDatosCompletosReceta/{nombreReceta}")
    @GET    
    @Consumes(MediaType.APPLICATION_JSON)
    public String obtenerTodoDeUnaRecetas(@PathParam("nombreReceta") String nombreReceta) { 
        consultaRealizada = preconsultaSparql(SERVICE_URI, prefijos+
            "SELECT DISTINCT ?descripcion ?imagen ?tiempoTotal ?categoriaReceta ?pasosRealizar ?ingredientes ?nombreReceta\n" +
            "WHERE {\n" +
                "?name schema:description ?descripcion.\n"+
                "?name schema:image ?imagen.\n"+
                "?name schema:totalTime ?tiempoTotal.\n"+
                "?name schema:recipeCategory ?categoriaReceta.\n"+
                "?name schema:name ?nombreReceta.\n"+
                    "{?name schema:text ?pasosRealizar.}\n"+
                "UNION\n"+
                    "{?name schema:recipeIngredient ?ingredientes.}\n"+                                               
                        "FILTER regex(?nombreReceta,"+"\""+nombreReceta+"\""+","+"\"i\""+")"+
            "}"+
            "ORDER BY ?ingredientes");                        
        return consultaRealizada;    
    }           
}
