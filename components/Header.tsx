'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'

const ASCII_LOGO = `
                                                                                +[                                                                           
                                                                              =@%                                                                         
                                                                               :@@>                                                                       
                                                                                +@@]                                                                      
                                                                                 ]@@]                                                                     
                                                                                  @@@)                                                                    
                                                                                  :@@%*                                                                   
                                                                                  =@@@>                                                                   
                                                     -=*]}%@@@%#[<*==-            =@@@@*                                                                  
                                                   :::-*)#@@@@@@@@@@@@@@@@@<-     #@@@@+                                                                  
                                                        -+     :-=)@@@@@@@@@@@@@@@@@@@@[-                                                                 
                                                           -)##)>-     *]#@@@@@@@@@@@@@@-                                                                 
                                                                <@@@@]:      <%@@@@@@@@@-                                                                 
               -<}@@@@@@@@@@@@@@@@@@@@@@%]                          @@@@@@}:      }@@@@#=                                                                 
       +]}@@@@@@}]]][}}}}[[[][[[}}}}[)[@@)=   %%%%%%%%%%%%%%%%%]:     *@@@@@@@}=    :)%=                                                                  
 :=]@@@@%})<[%}])<<<<<<<<<<<<<<<<<<<[}]@@=   [@@}]]][[[[][[)}@@         +@@@@@@@@#                                                                        
=@@@@#>[%[<<<<<<<<<<<<<<<<<<<<<<<<<<<)%<@@*    @@#*}<<<<<<<)#}@@]+       -[@@@@@@@#                                                                       
@@@)}#])<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<}##@%>   @@@<%<<<<<<<<]%)@@+        }@@@@@@#                             :=*>>>*=                            
@@#]}[)<<<<<<<<<<<<<<<<<<)))))<<<<<)@+@@>   +@@%]}<<<<<<<<%*@@@@@@@@@@@@@@@@@}<-  <@@@@@@%      ->)[#@@@@@@@@@@@@@> +<[@@@@@@@@@@@@@@@@@@@@}<=                   
@@@)}[<<<<<<<<<<<<<<<<<)]}@@@@@@%#####%@@@@@@]%@@@@] @@@:%<<<<<<<<[%<<><}%@@@@@@@@%[>=)%@@@@%=}@@@@@=  *%@@@@@%]<>>******-@@@@@@@#<*>[%@%#####%@@}<*<#@@@@@<                
@@]]%<<<<<<<<<<<<<<<<[@@@#]<<<<<<<<<<<<<<<<<)#@<>@@@@@}@]<<<<<<<<[)<<<<<<<<<<<<<<<<<<)}@[+%@@@@@@@@%@@@]<%%[))<<<<<<<<]@]@%<]%})<<<<<<<<<<<<<<<<<<<<]#@><@@@@>             
@@][#<<<<<<<<<<<<<<)#@@})<<<<<<<<<<<<<<<<<<<<<<<<<<<)}#>@@@-@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<[#)[@@@@@@#]#})<<<<<<<<<<<@:]#[)<<<<<<<<<<<<<<<<<<<<<<<<<<<<}%<}@@@:
`

export function Header() {
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#0a0a0a',
        borderBottom: '1px solid #0099dd',
        boxShadow: '0 0 20px rgba(0, 153, 221, 0.3)',
        py: 1,
        px: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1600px',
          mx: 'auto',
        }}
      >
        {/* Logo and Company Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            sx={{
              color: '#0099dd',
              fontFamily: '"VT323", monospace',
              fontSize: '1.5rem',
              textShadow: '0 0 10px #0099dd',
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
            }}
          >
            GORZEN ENGINEERING
          </Typography>
        </Box>

        {/* Right side - can add nav items here later */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography
            sx={{
              color: '#666',
              fontFamily: '"Share Tech Mono", monospace',
              fontSize: '0.75rem',
            }}
          >
            AM INVENTORY SYSTEM v1.0
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Header

