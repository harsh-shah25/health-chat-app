package org.bhagya.apigateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(
    properties = {
        "spring.cloud.gateway.routes[0].id=test-route",
        "spring.cloud.gateway.routes[0].uri=http://localhost:8080",
        "spring.cloud.gateway.routes[0].predicates[0]=Path=/test/**"
    }
)
@ActiveProfiles("test")
class ApigatewayApplicationTests {

	@Test
	void contextLoads() {
	}

}
