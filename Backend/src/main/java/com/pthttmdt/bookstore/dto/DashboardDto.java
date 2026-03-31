package com.pthttmdt.bookstore.dto;

import lombok.Data;
import java.util.List;

@Data
public class DashboardDto {
    private String totalRevenue;
    private long totalOrders;
    private long totalUsers;
    private long totalBooks;
    private List<RecentOrder> recentOrders;
    private List<TopBook> topBooks;

    @Data
    public static class RecentOrder {
        private String id;
        private String customer;
        private String total;
        private String status;
        private String date;
    }

    @Data
    public static class TopBook {
        private String title;
        private long sold;
        private String revenue;
    }
}
