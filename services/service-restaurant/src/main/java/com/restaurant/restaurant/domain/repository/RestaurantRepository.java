package com.restaurant.restaurant.domain.repository;

import com.restaurant.restaurant.domain.model.Restaurant;
import com.restaurant.restaurant.domain.model.RestaurantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {

    Page<Restaurant> findByStatus(RestaurantStatus status, Pageable pageable);

    Page<Restaurant> findByCityAndStatus(String city, RestaurantStatus status, Pageable pageable);

    @Query(value = """
            SELECT * FROM restaurants r
            WHERE r.status = 'ACTIVE'
              AND earth_distance(
                    ll_to_earth(r.latitude, r.longitude),
                    ll_to_earth(:lat, :lng)
                  ) <= :radiusMeters
            ORDER BY earth_distance(
                        ll_to_earth(r.latitude, r.longitude),
                        ll_to_earth(:lat, :lng)
                     )
            """, nativeQuery = true)
    List<Restaurant> findNearby(@Param("lat") double lat,
                                @Param("lng") double lng,
                                @Param("radiusMeters") double radiusMeters);

    List<Restaurant> findByManagerId(UUID managerId);
}
